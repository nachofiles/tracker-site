import Dexie from 'dexie';
import { getSignerTrackerContract, getTrackerContract } from './eth';
import { FileMetadata, IFileMetadata } from '@ethny-tracker/tracker-protos';
import blobToBuffer from 'blob-to-buffer';
import { getBytes32FromIpfsHash, getIpfsHashFromBytes32, Multihash } from './util/hash';

export interface IpfsFileMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: number;
  mimeType: string;
  sizeBytes: number;
  author: string;
  dataUri: string;
}

export interface Page<T> {
  data: T[];
  total: number;
  end: boolean;
}

export interface SyncState {
  numSynced: number;
  total: number;
}

export type SyncUpdateCallback = (err: Error | null, data: SyncState) => void;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class IpfsFileDexie extends Dexie {
  ipfsFiles: Dexie.Table<IpfsFileMetadata, string>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      ipfsFiles: [
        'id',
        'title',
        'description',
        'category',
        'mimeType',
        'sizeBytes',
        'author',
        'dataUri',
        'createdAt'
      ].join(',')
    });
    this.ipfsFiles = this.table('ipfsFiles');
  }
}

interface IPFS {
  cat: (multihash: Multihash) => Buffer;
  add: (buffer: Buffer) => Promise<[ { hash: string } ]>;
}

export class FileMetadataDatabase {
  private contractAddress: string;
  private db: IpfsFileDexie;
  private numSynced: number = 0;
  private total: number = 0;
  private ipfs: IPFS;
  private contract: ReturnType<typeof getTrackerContract>;

  constructor(contractAddress: string, ipfs: IPFS) {
    this.contractAddress = contractAddress;
    this.contract = getTrackerContract(this.contractAddress);

    this.db = new IpfsFileDexie(`inodes-${contractAddress}`);
    this.numSynced = parseInt(
      localStorage.getItem(`inodes-index-${contractAddress}`) || '0',
      10
    );
    this.ipfs = ipfs;
  }

  async getSyncState(): Promise<SyncState> {
    const total = await this.contract.functions.numFileMetadata();
    this.total = total.toNumber();

    return {
      numSynced: this.numSynced,
      total: this.total
    };
  }

  async startSync(cb: SyncUpdateCallback) {
    const total = await this.contract.functions.numFileMetadata();
    this.total = total.toNumber();

    for (let i = this.numSynced; i < this.total; i++) {
      const metaData = await this.contract.functions.allFileMetadata(i);

      const cid = getIpfsHashFromBytes32(metaData.ipfsHash);

      localStorage.setItem(
        `inodes-index-${this.contractAddress}`,
        `${++this.numSynced}`
      );

      try {
        const metaFile = await Promise.race([
          this.ipfs.cat(cid),
          sleep(1000)
        ]);
        if (!metaFile) {
          throw new Error(`Error fetching metafile: ${cid}`);
        }

        const meta = FileMetadata.decode(metaFile as Uint8Array);
        await this.db.ipfsFiles.add({
          ...meta,
          id: cid,
          dataUri: meta.uri,
          author: metaData.creator,
          createdAt: Date.now(),
          mimeType: meta.mimeType,
          sizeBytes: meta.sizeBytes as any
        });

        cb(null, {
          numSynced: this.numSynced,
          total: this.total
        });
      } catch (err) {
        cb(new Error(`Error fetching metafile: ${cid} ${err.message}`), {
          numSynced: this.numSynced,
          total: this.total
        });
      }
    }
  }

  listenForNewMetadata() {
    this.contract.addListener(
      this.contract.filters.FileMetadataAdded(null, null, null, null),
      data => {
        console.log('contract listening filter', data);
      }
    );
  }

  async clearData(): Promise<void> {
    await this.db.delete();
    this.db = new IpfsFileDexie(`inodes-${this.contractAddress}`);
    localStorage.removeItem(`inodes-index-${this.contractAddress}`);
  }

  async search(
    query: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Page<IpfsFileMetadata>> {
    const filterString = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .join(' ');
    const ipfsFiles = this.db.ipfsFiles.filter(inode =>
      inode.title.toLowerCase().includes(filterString)
    );
    const total = await ipfsFiles.count();
    const data = await ipfsFiles
      .offset(offset)
      .limit(limit)
      .toArray();
    const end = offset + data.length === total;

    return {
      data,
      total,
      end
    };
  }

  async latest(
    limit: number = 10,
    offset: number = 0
  ): Promise<Page<IpfsFileMetadata>> {
    const ipfsFiles = this.db.ipfsFiles.orderBy('createdAt');
    const total = await ipfsFiles.count();
    const data = await ipfsFiles
      .offset(offset)
      .limit(limit)
      .toArray();
    const end = offset + data.length === total;

    return {
      data,
      total,
      end
    };
  }

  async addFile(file: File) {
    const buf = await this.toBufferAsync(file);
    const [ addDataRes ] = await this.ipfs.add(buf);
    return addDataRes.hash;
  }

  private toBufferAsync(blob: Blob): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      blobToBuffer(blob, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf);
        }
      });
    });
  }

  public getFileMetadata(cid: string) {
    return this.db.ipfsFiles.get(cid);
  }

  public async getFileContent(cid: string): Promise<Uint8Array> {
    return this.ipfs.cat(cid);
  }

  // Assumes base58 ipfs hash
  async add(args: IFileMetadata) {
    const metadataBytes = FileMetadata.encode(args).finish();

    const ipfsResults = await this.ipfs.add(
      Buffer.from(metadataBytes)
    );

    const ipfsMultihash = ipfsResults[ 0 ].hash;

    const bytes32Hash = getBytes32FromIpfsHash(ipfsMultihash);

    const contract = await getSignerTrackerContract(this.contractAddress);
    const request = await contract.functions.addFile(bytes32Hash);

    await request.wait();
  }

  public resolveAddress(address: string) {
    return this.contract.provider.lookupAddress(address);
  }
}
