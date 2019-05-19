import { configure } from 'mobx';
import { InodeStore } from './InodeStore';
import { UploadStore } from './uploadStore';
import { DownloadStore } from './downloadStore';
import { EnsStore } from './ensStore';

export class RootStore {
  public readonly inode: InodeStore;
  public readonly upload: UploadStore;
  public readonly download: DownloadStore;
  public readonly ensStore: EnsStore;

  constructor() {
    configure({
      enforceActions: 'never'
    });

    this.inode = new InodeStore(
      this,
      '0x5868dC64C04348c3eEfF99c55ddDd2064Ff5F90d',
      10,
      true
    );
    this.upload = new UploadStore(this);
    this.download = new DownloadStore(this);
    this.ensStore = new EnsStore(this);
  }
}
