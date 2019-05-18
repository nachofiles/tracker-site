import { configure } from "mobx";
import { InodeStore } from "./InodeStore";

export class RootStore {
  public readonly inode: InodeStore;

  constructor() {
    configure({
      enforceActions: true
    });

    this.inode = new InodeStore(this);
  }
}
