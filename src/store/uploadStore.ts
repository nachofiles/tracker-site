import { observable } from "mobx";
import { RootStore } from "./rootStore";

export class UploadStore {
  private rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable
  public isUploading = false;
  @observable
  public fileName = "";
  @observable
  public fileSize = 0;
  @observable
  public fileType = "";
  @observable
  public fileLastModified = 0;

  public preuploadFile(file: File) {
    this.fileName = file.name;
    this.fileSize = file.size;
    this.fileType = file.type;
    this.fileLastModified = file.lastModified;
  }

  public async uploadFile(file: File) {
    const db = await this.rootStore.inode.getDb();
    this.isUploading = true;
    try {
      await db.addFile(file);
    } catch (e) {
      console.warn("Error uploading file:", e);
    }

    this.isUploading = false;
  }
}
