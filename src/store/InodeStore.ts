import { RootStore } from "./rootStore";
import { Inode, InodeDatabase, Pageable } from "../lib/db";

interface SearchParams {
  query: string;
  page: number;
}

interface GetLatestParams {
  page: number;
}

export class InodeStore {
  // results of the search request
  public searchResults: Inode[] = [];
  // total number of pages from the search result
  public pages: number = 1;
  // the number of results to show per page
  public resultsPerPage: number;

  private rootStore: RootStore;
  private db: InodeDatabase;

  constructor(
    rootStore: RootStore,
    contractAddress: string,
    resultsPerPage: number
  ) {
    this.db = new InodeDatabase(contractAddress);
    this.resultsPerPage = resultsPerPage;
    this.rootStore = rootStore;
  }

  public async search(params: SearchParams): Promise<void> {
    const limit = this.resultsPerPage;
    const offset = this.resultsPerPage * params.page;

    const searchResults = await this.db.search(params.query, limit, offset);

    this.pages = Math.ceil(searchResults.total / this.resultsPerPage);
    this.searchResults = searchResults.data;
  }

  public async getLatest(params: GetLatestParams) {
    const limit = this.resultsPerPage;
    const offset = this.resultsPerPage * params.page;

    const searchResults = await this.db.latest(limit, offset);

    this.pages = Math.ceil(searchResults.total / this.resultsPerPage);
    this.searchResults = searchResults.data;
  }

  public async clear() {
    await this.db.clearData();
    this.searchResults = [];
  }
}
