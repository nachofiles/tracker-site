import Dexie from "dexie";

export interface Inode {
  id: string;
  title: string;
  description: string;
  category: string;
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

export type SyncUpdateCallback =
  | ((err: Error, data: undefined) => void)
  | ((err: undefined, data: SyncUpdate) => void);

export class InodeDatabase {
  db: Dexie;

  constructor(contractAddr: string) {
    this.db = new Dexie(`inodes-${contractAddr}`);
    this.db.version(1).stores({
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
  }

  startSync(cb: SyncUpdateCallback) {
    return;
  }

  getSyncState(): Promise<SyncState> {
    return Promise.resolve({
      numSynced: 0,
      total: 0
    });
  }

  search(
    query: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Pageable<Inode>> {
    return Promise.resolve({
      data: [],
      total: 0,
      end: true
    });
  }

  latest(limit: number = 10, offset: number = 0): Promise<Pageable<Inode>> {
    return Promise.resolve({
      data: [],
      total: 0,
      end: true
    });
  }
}
