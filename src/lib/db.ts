import Dexie from "dexie";
import IPFS from "typestub-ipfs";
import bs58 from "bs58";
import { getSignerTrackerContract, getTrackerContract } from "./eth";
import { FileMetadata, IFileMetadata } from "@ethny-tracker/tracker-protos";
import blobToBuffer from "blob-to-buffer";

export interface Inode {
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

export interface Pageable<T> {
  data: T[];
  total: number;
  end: boolean;
}

export interface SyncState {
  numSynced: number;
  total: number;
}

export type SyncUpdate = SyncState;

export type SyncUpdateCallback = (err?: Error, data?: SyncUpdate) => void;

function getBytes32FromIpfsHash(ipfsListing: string) {
  return (
    "0x" +
    bs58
      .decode(ipfsListing)
      .slice(2)
      .toString("hex")
  );
}

function getIpfsHashFromBytes32(bytes32Hex: string) {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = "1220" + bytes32Hex.slice(2);
  const hashBytes = Buffer.from(hashHex, "hex");
  const hashStr = bs58.encode(hashBytes);
  return hashStr;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class InodeDexie extends Dexie {
  inodes: Dexie.Table<Inode, string>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      inodes: [
        "id",
        "title",
        "description",
        "category",
        "mimeType",
        "sizeBytes",
        "author",
        "dataUri",
        "createdAt"
      ].join(",")
    });
    this.inodes = this.table("inodes");
  }
}

export class InodeDatabase {
  private contractAddress: string;
  private db: InodeDexie;
  private numSynced: number = 0;
  private total: number = 0;
  private ipfs: IPFS;
  private contract: ReturnType<typeof getTrackerContract>;

  constructor(contractAddress: string, ipfs: IPFS) {
    this.contractAddress = contractAddress;
    this.contract = getTrackerContract(this.contractAddress);

    this.db = new InodeDexie(`inodes-${contractAddress}`);
    this.numSynced = parseInt(
      localStorage.getItem(`inodes-index-${contractAddress}`) || "0",
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

  async startSync(cb: SyncUpdateCallback, shouldPoll = false) {
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
          (this.ipfs as any).cat(cid),
          sleep(1000)
        ]);

        if (!metaFile) {
          throw Error(`Error fetching metafile: ${cid}`);
        }

        const meta = FileMetadata.decode(metaFile as Uint8Array);
        this.db.inodes.add({
          ...meta,
          id: cid,
          dataUri: meta.uri,
          author: metaData.creator,
          createdAt: Date.now(),
          mimeType: "application/zip",
          sizeBytes: 0
        });

        cb(undefined, {
          numSynced: this.numSynced,
          total: this.total
        });
      } catch (err) {
        cb(new Error(`Error fetching metafile: ${cid}`), {
          numSynced: this.numSynced,
          total: this.total
        });
      }
    }

    if (shouldPoll) {
      console.log("polling for new changes...");
      window.setTimeout(() => {
        this.startSync(cb);
      }, 250);
    }
  }

  // TODO: handle the data
  listen() {
    this.contract.addListener(
      this.contract.filters.FileMetadataAdded(null, null, null, null),
      data => {
        console.log("contract listening filter", data);
      }
    );
  }

  async clearData(): Promise<void> {
    await this.db.delete();
    this.db = new InodeDexie(`inodes-${this.contractAddress}`);
    localStorage.removeItem(`inodes-index-${this.contractAddress}`);
  }

  async search(
    query: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Pageable<Inode>> {
    const inodes = this.db.inodes.filter(inode =>
      inode.title.toLowerCase().includes(query.toLowerCase())
    );
    const total = await inodes.count();
    const data = await inodes
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
  ): Promise<Pageable<Inode>> {
    const inodes = this.db.inodes.orderBy("createdAt");
    const total = await inodes.count();
    const data = await inodes
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
    const [addDataRes] = await (this.ipfs as any).add(buf);
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

  // Assumes base58 ipfs hash
  async add(args: IFileMetadata) {
    const metadataBytes = FileMetadata.encode(args).finish();

    const ipfsResults = await (this.ipfs as any).add(metadataBytes);

    const ipfsMultihash = ipfsResults[0].hash;

    const bytes32Hash = getBytes32FromIpfsHash(ipfsMultihash);

    const contract = await getSignerTrackerContract(this.contractAddress);
    await contract.functions.addFile(bytes32Hash);
  }
}
