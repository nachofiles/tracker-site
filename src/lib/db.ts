import Dexie from 'dexie';
import { getSignerTrackerContract, getTrackerContract } from './eth';
import { FileMetadata, IFileMetadata } from '@ethny-tracker/tracker-protos';
import blobToBuffer from 'blob-to-buffer';
import { getBytes32FromIpfsHash, getIpfsHashFromBytes32, Multihash } from './util/hash';
import { Tracker } from '@ethny-tracker/tracker-contracts/build/types/ethers/Tracker';

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
  private numSynced: number = 0;
  private total: number = 0;
  private ipfs: IPFS;
  private contract: Tracker | null = null;
  private db: IpfsFileDexie | null = null;
  private initialized: boolean = false;

  constructor(ipfs: IPFS) {
    this.ipfs = ipfs;
  }

  private async init() {
    if (this.initialized) {
      return;
    }

    this.contract = await getTrackerContract();
    this.db = new IpfsFileDexie(`inodes-${this.contract.address}`);
    this.numSynced = parseInt(localStorage.getItem(`inodes-index-${this.contract.address}`) || '0', 10);

    this.initialized = true;
  }

  async getSyncState(): Promise<SyncState> {
    await this.init();

    const total = await this.contract!.functions.numFileMetadata();
    this.total = total.toNumber();

    return {
      numSynced: this.numSynced,
      total: this.total
    };
  }

  async startSync(cb: SyncUpdateCallback): Promise<void> {
    await this.init();

    const contract = this.contract!;
    const db = this.db!;
    const total = await contract.functions.numFileMetadata();
    this.total = total.toNumber();

    for (let i = this.numSynced; i < this.total; i++) {
      const metaData = await contract.functions.allFileMetadata(i);

      const cid = getIpfsHashFromBytes32(metaData.ipfsHash);

      localStorage.setItem(
        `inodes-index-${contract.address}`,
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
        await db.ipfsFiles.add({
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

  async listenForNewMetadata() {
    await this.init();

    this.contract!.addListener(
      this.contract!.filters.FileMetadataAdded(null, null, null, null),
      data => {
        console.log('contract listening filter', data);
      }
    );
  }

  async clearData(): Promise<void> {
    await this.init();

    await this.db!.delete();
    this.db = new IpfsFileDexie(`inodes-${this.contract!.address}`);
    localStorage.removeItem(`inodes-index-${this.contract!.address}`);
  }

  async search(
    query: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Page<IpfsFileMetadata>> {
    await this.init();

    const filterString = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .join(' ');
    const ipfsFiles = this.db!.ipfsFiles.filter(inode =>
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
    await this.init();

    const ipfsFiles = this.db!.ipfsFiles.orderBy('createdAt');
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
    await this.init();

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

  public async getFileMetadata(cid: string) {
    await this.init();

    return this.db!.ipfsFiles.get(cid);
  }

  public async getFileContent(cid: string): Promise<Uint8Array> {
    await this.init();

    return this.ipfs.cat(cid);
  }

  // Add a file metadata object to the database.
  async addFileMetadata(args: IFileMetadata) {
    await this.init();

    const metadataBytes = FileMetadata.encode(args).finish();

    const ipfsResults = await this.ipfs.add(
      Buffer.from(metadataBytes)
    );

    const ipfsMultihash = ipfsResults[ 0 ].hash;

    const bytes32Hash = getBytes32FromIpfsHash(ipfsMultihash);

    const contract = await getSignerTrackerContract();
    const request = await contract.functions.addFile(bytes32Hash);

    await request.wait();
  }

  public async resolveAddress(address: string) {
    await this.init();

    return this.contract!.provider.lookupAddress(address);
  }
}
