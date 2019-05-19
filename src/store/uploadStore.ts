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
  public file: File | null = null;
  @observable
  public fileHash = "";

  public async uploadFileData(file: File) {
    const db = await this.rootStore.inode.getDb();
    this.fileHash = '';
    this.file = null;
    this.isUploadingFileData = true;
    try {
      this.fileHash = await db.addFile(file);
      this.file = file;
    } catch (e) {
      console.warn("Error uploading file:", e);
    }

    this.isUploadingFileData = false;
    console.log('upload done', this);
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
    console.log('upload done', this);
  }
}
