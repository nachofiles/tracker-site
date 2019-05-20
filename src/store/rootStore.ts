import { configure } from 'mobx';
import { FileMetadataStore } from './fileMetadataStore';
import { UploadStore } from './uploadStore';
import { DownloadStore } from './downloadStore';
import { EnsStore } from './ensStore';

export class RootStore {
  public readonly fileMetadata: FileMetadataStore;
  public readonly upload: UploadStore;
  public readonly download: DownloadStore;
  public readonly ensStore: EnsStore;

  constructor() {
    configure({
      enforceActions: 'never'
    });

    this.fileMetadata = new FileMetadataStore(this, 10, true);
    this.upload = new UploadStore(this);
    this.download = new DownloadStore(this);
    this.ensStore = new EnsStore(this);
  }
}
