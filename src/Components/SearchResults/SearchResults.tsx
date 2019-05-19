import React from "react";
import { RouteComponentProps } from "react-router";
import { Table, Button, Icon } from "antd";
import "./SearchResults.css";
import { inject, observer } from "mobx-react";
import { RootStore } from "../../store/rootStore";
import { ColumnProps } from "antd/lib/table";
import filesize from "filesize";
import { Link } from "react-router-dom";

const columns: ColumnProps<any>[] = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category"
  },
  {
    title: "File Type",
    dataIndex: "mimeType",
    key: "fileType"
  },
  {
    title: "File Size",
    dataIndex: "sizeBytes",
    key: "fileSize",
    render: (size: number) => {
      return filesize(size);
    }
  },
  {
    title: "Author",
    key: "author",
    dataIndex: "author"
  }
];

interface Props extends RouteComponentProps {
  store: RootStore;
}

interface State {
  currPage: number;
}

@inject('store')
@observer
export class SearchResults extends React.Component<Props, State> {
  public state: State = {
    currPage: 1
  };

  componentWillMount() {
    this.search();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const prevQueryParams = new URLSearchParams(prevProps.location.search);
    const prevQuery = prevQueryParams.get('query');

    if (
      this.getQuery() === prevQuery &&
      prevState.currPage === this.state.currPage
    ) {
      return;
    }
    this.search();
  }

  private search() {
    const query = this.getQuery();
    if (!query) {
      return;
    }

    this.inodeStore.search({
      query,
      page: this.state.currPage
    });
  }

  private get inodeStore() {
    return this.props.store.inode;
  }

  private getQuery() {
    const queryParams = new URLSearchParams(this.props.location.search);
    const query = queryParams.get('query');
    return query;
  }

  private getLatest = () => {
    this.inodeStore.getLatest({ page: this.state.currPage });
  };

  public render() {
    return (
      <div className="Table-container">
        <div className="Table-content">
          <div className="Search-button-group">
            <Link to="/">
              <Button ghost>
                <Icon type="left" />
                Go back
              </Button>
            </Link>
            <Button ghost icon="download" onClick={this.getLatest}>
              Get Latest
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={this.inodeStore.searchResults}
            pagination={{
              current: this.state.currPage,
              pageSize: this.inodeStore.resultsPerPage,
              total: this.inodeStore.total,
              onChange: page => this.setState({ currPage: page })
            }}
            loading={this.props.store.inode.loadingSearchResults}
            rowKey="id"
          />
        </div>
      </div>
    );
  }
}
