import { configure } from "mobx";
import { InodeStore } from "./InodeStore";

export class RootStore {
  public readonly inode: InodeStore;

  constructor() {
    configure({
      enforceActions: "observed"
    });

    this.inode = new InodeStore(this, '0xF337f1C8f8f0850Cd8eca577730f725C6E6FA451', 10, true);
  }
}
