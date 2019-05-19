import { RootStore } from './rootStore';
import { observable } from 'mobx';

export class EnsStore {
  @observable
  public ensNames: { [ address: string ]: string } = {};

  @observable
  public isLoading: { [ address: string ]: boolean } = {};

  private promises: { [ address: string ]: Promise<string> } = {};

  private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  public async resolveName(address: string) {
    if (this.promises[ address ] || this.ensNames[ address ]) {
      return;
    }

    const db = await this.rootStore.inode.getDb();

    this.isLoading = { ...this.isLoading, [ address ]: true };
    this.promises[ address ] = db.resolveAddress(address);

    try {
      this.ensNames = { ...this.ensNames, [ address ]: await this.promises[ address ] };
      this.isLoading = { ...this.isLoading, [ address ]: false };
    } catch (error) {
      console.info('failed to ens name for lookup address', address);
      // to try again, uncomment this line
      // delete this.promises[ address ];
      this.isLoading = { ...this.isLoading, [ address ]: false };
    }
  }
}
