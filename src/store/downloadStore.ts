import { RootStore } from './rootStore';
import { IpfsFileMetadata } from '../lib/db';
import { observable } from 'mobx';

export class DownloadStore {
  @observable
  public filemetaData: IpfsFileMetadata | null = null;

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

  public async getFileContent(cid: string): Promise<Uint8Array> {
    const db = await this.rootStore.inode.getDb();

    return db.getFileContent(cid);
  }
}
