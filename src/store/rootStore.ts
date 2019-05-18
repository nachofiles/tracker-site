import { configure } from "mobx";

export class RootStore {
  public readonly inode: any;

  constructor() {
    configure({
      enforceActions: true
    });
  }
}
