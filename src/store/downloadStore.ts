import { RootStore } from "./rootStore";
import { Inode } from "../lib/db";
import { observable } from "mobx";

export class DownloadStore {
  @observable
  public filemetaData: Inode | null = null;

  private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  public async getFileMetadata(cid: string) {
    const db = await this.rootStore.inode.getDb();
    const metadata = await db.getFileMetadata(cid);
    if (metadata) {
      this.filemetaData = metadata;
    }
  }

  public async getFile(cid: string) {
    const db = await this.rootStore.inode.getDb();
    const file = await db.getFile(cid);
    return file;
  }
}
