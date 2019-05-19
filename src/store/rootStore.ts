import { configure } from "mobx";
import { InodeStore } from "./InodeStore";
import { UploadStore } from "./uploadStore";
import { DownloadStore } from "./downloadStore";

export class RootStore {
  public readonly inode: InodeStore;
  public readonly upload: UploadStore;
  public readonly download: DownloadStore;

  constructor() {
    configure({
      enforceActions: "never"
    });

    this.inode = new InodeStore(
      this,
      "0xF337f1C8f8f0850Cd8eca577730f725C6E6FA451",
      10,
      true
    );
    this.upload = new UploadStore(this);
    this.download = new DownloadStore(this);
  }
}
