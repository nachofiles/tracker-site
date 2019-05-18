import Dexie from "dexie";
import IPFS from "typestub-ipfs";
import bs58 from "bs58";
import { getTrackerContract, getSignerTrackerContract } from "./eth";

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

export type SyncUpdate = {
  inode: Inode;
} & SyncState;

export type SyncUpdateCallback = (err?: Error, data?: SyncUpdate) => void;

function getIpfsHashFromBytes32(bytes32Hex: string) {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = "1220" + bytes32Hex.slice(2);
  const hashBytes = Buffer.from(hashHex, 'hex');
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
        "dataUri"
      ].join(",")
    });
    this.inodes = this.table("inodes");
  }
}

export class InodeDatabase {
  private contractAddress: string;
  private db: InodeDexie;
  private total: number;
  private ipfs: IPFS;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    this.db = new InodeDexie(`inodes-${contractAddress}`);
    this.total = 0;
    this.ipfs = new IPFS({ start: false });
  }

  async startIPFS() {
    return new Promise(resolve => {
      this.ipfs.start(() => {
        resolve();
      });
    });
  }

  async startSync(cb: SyncUpdateCallback) {
    const contract = getTrackerContract(this.contractAddress);
    const total = await contract.functions.numFileMetadata();
    this.total = total.toNumber();
    console.log('Number of files:', this.total);

    await this.startIPFS();
    for (let i = 0; i < this.total; i++) {
      const metaData = await contract.functions.allFileMetadata(i);
      const cid = getIpfsHashFromBytes32(metaData.ipfsHash);
      console.log(cid);
      const metaFile = await Promise.race([
        this.ipfs.files.get(cid),
        sleep(1000),
      ]);
      if (!metaFile) {
        console.log('Bailed out yo');
        continue;
      }
      console.log(metaFile);
    }

    // const numSynced = await this.db.inodes.count();
    // for (let i = numSynced; i < TOTAL; i++) {
    //   try {
    //     const inode = await generateInode();
    //     await this.db.inodes.add(inode);
    //     cb(undefined, {
    //       inode,
    //       total: TOTAL,
    //       numSynced: i + 1
    //     });
    //   } catch (err) {
    //     cb(err as Error, undefined);
    //   }
    // }
  }

  async getSyncState(): Promise<SyncState> {
    const numSynced = await this.db.inodes.count();
    return {
      numSynced,
      total: this.total,
    };
  }

  async clearData(): Promise<void> {
    await this.db.delete();
    this.db = new InodeDexie(`inodes-${this.contractAddress}`);
  }

  async search(
    query: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Pageable<Inode>> {
    const inodes = this.db.inodes.filter(inode => inode.title.includes(query));
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
      end,
    };
  }

  async add(hash: string) {
    const contract = await getSignerTrackerContract(this.contractAddress);
    contract.functions.addFile(hash);
  }
}
