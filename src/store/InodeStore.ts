import { RootStore } from "./rootStore";
import { Inode, InodeDatabase } from "../lib/db";
import { action, computed, observable, autorun, runInAction } from "mobx";
import IPFS from "ipfs";

interface SearchParams {
  query: string;
  page: number;
}

interface GetLatestParams {
  page: number;
}

interface UpdateSyncAction {
  inodesSynced: number;
  totalInodes: number;
}

interface UpdateSearchResultsAction {
  data: Inode[];
  total: number;
}

export class InodeStore {
  // search state

  // results of the search request
  @observable
  public searchResults: Inode[] = [];

  @observable
  public loadingSearchResults: boolean = false;

  @observable
  public total: number = 0;
  // the number of results to show per page
  public resultsPerPage: number;

  // sync state
  @observable
  public inodesSynced: number = 0;
  @observable
  public totalInodesToSync: number = Infinity;

  // internal
  private rootStore: RootStore;
  private db: InodeDatabase | undefined;
  private contractAddress: string;
  private ipfsNode = new IPFS();
  constructor(
    rootStore: RootStore,
    contractAddress: string,
    resultsPerPage: number,
    autoSync: boolean = false
  ) {
    // delete me
    (window as any).db = this.db;
    this.resultsPerPage = resultsPerPage;
    this.rootStore = rootStore;
    this.contractAddress = contractAddress;

    if (autoSync) {
      this.syncWatcher();
    }
  }

  private getDb(): Promise<InodeDatabase> {
    return new Promise(resolve => {
      if (!this.db) {
        this.ipfsNode.once("ready", () => {
          console.log("ipfs ready");
          this.db = new InodeDatabase(this.contractAddress, this.ipfsNode);
          console.log(this.ipfsNode.files);
          return resolve(this.db);
        });
      } else {
        return resolve(this.db);
      }
    });
  }

  @computed
  public get isDbSynced(): boolean {
    const isSynced = this.inodesSynced === this.totalInodesToSync;
    console.log("isDbSynced:", isSynced);
    return isSynced;
  }

  /**
   * Initialize the store to begin syncing.
   */
  public init(): void {
    const initiator = async () => {
      const db = await this.getDb();
      const syncState = await db.getSyncState();
      this.updateSyncProgress({
        inodesSynced: syncState.numSynced,
        totalInodes: syncState.total
      });

      db.startSync((err, syncState) => {
        if (err) {
          console.warn("Error while syncing:", err);
        }
        if (!syncState) {
          throw Error("Result must exist");
        }

        this.updateSyncProgress({
          inodesSynced: syncState.numSynced,
          totalInodes: syncState.total
        });
      });
    };

    initiator();
  }

  private syncWatcher() {
    autorun(() => {
      if (!this.isDbSynced) {
        console.log("Running store init");
        this.init();
      }
    });
  }

  /**
   * Search for paginated inode results
   * @param params Search parameters
   */
  public async search(params: SearchParams): Promise<void> {
    const db = await this.getDb();
    const limit = this.resultsPerPage;
    const offset = this.resultsPerPage * (params.page - 1);

    runInAction(() => {
      this.loadingSearchResults = true;
    });
    const searchResults = await db.search(params.query, limit, offset);

    this.updateSearchResults({
      total: searchResults.total,
      data: searchResults.data
    });
  }

  /**
   * Get the latest paginated inode results
   * @param params Pagination parameters
   */
  public async getLatest(params: GetLatestParams) {
    const db = await this.getDb();
    const limit = this.resultsPerPage;
    const offset = this.resultsPerPage * params.page;

    runInAction(() => {
      this.loadingSearchResults = true;
    });

    const searchResults = await db.latest(limit, offset);

    console.log("[getLatest]", searchResults);

    this.updateSearchResults({
      total: searchResults.total,
      data: searchResults.data
    });
  }

  /**
   * Clear the internal db and current results
   */
  public async clear() {
    const db = await this.getDb();
    await db.clearData();
    this.clearResults();
  }

  @action("updateSyncProgress")
  private updateSyncProgress(params: UpdateSyncAction): void {
    console.log("updateSyncProgress:", params);
    this.inodesSynced = params.inodesSynced;
    this.totalInodesToSync = params.totalInodes;
  }

  @action("updateSearchResults")
  private updateSearchResults(params: UpdateSearchResultsAction): void {
    console.log("updateSearchResults:", params);
    this.searchResults = params.data;
    console.log(params.total);
    this.total = params.total;
    this.loadingSearchResults = false;
  }

  @action("clearResults")
  private clearResults() {
    console.log("clearResults");

    this.searchResults = [];
    this.totalInodesToSync = Infinity;
    this.inodesSynced = 0;
  }
}
