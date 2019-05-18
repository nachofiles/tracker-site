import Dexie from "dexie";
import { generateInode } from "./mock";

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

const TOTAL = 100;

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

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    this.db = new InodeDexie(`inodes-${contractAddress}`);
  }

  async startSync(cb: SyncUpdateCallback) {
    const numSynced = await this.db.inodes.count();
    for (let i = numSynced; i < TOTAL; i++) {
      try {
        const inode = await generateInode();
        await this.db.inodes.add(inode);
        cb(undefined, {
          inode,
          total: TOTAL,
          numSynced: i + 1
        });
      } catch (err) {
        cb(err as Error, undefined);
      }
    }
  }

  async getSyncState(): Promise<SyncState> {
    const numSynced = await this.db.inodes.count();
    return {
      numSynced,
      total: TOTAL
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
      end
    };
  }
}