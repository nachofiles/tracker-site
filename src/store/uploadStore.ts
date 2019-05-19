import { observable } from "mobx";
import { RootStore } from "./rootStore";
import { IFileMetadata } from "@ethny-tracker/tracker-protos";

export class UploadStore {
  private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable
  public isUploadingMetadata: boolean = false;

  @observable
  public uploadMetadataError: Error | null = null;
  @observable
  public isUploadingFileData = false;
  @observable
  public fileHash = "";

  public async uploadFileData(file: File) {
    const db = await this.rootStore.inode.getDb();
    this.isUploadingFileData = true;
    try {
      this.fileHash = await db.addFile(file);
    } catch (e) {
      console.warn("Error uploading file:", e);
    }

    this.isUploadingFileData = false;
  }

  public async uploadFileMetadata(node: IFileMetadata) {
    const db = await this.rootStore.inode.getDb();
    this.isUploadingMetadata = true;
    this.uploadMetadataError = null;

    try {
      await db.add(node);
    } catch (error) {
      this.uploadMetadataError = error;
    }

    this.isUploadingMetadata = false;
  }
}
