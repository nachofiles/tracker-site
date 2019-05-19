import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Table } from 'antd';
import './SearchResults.css';
import { inject, observer } from 'mobx-react';
import { RootStore } from '../../store/rootStore';
import { ColumnProps } from 'antd/lib/table';
import filesize from 'filesize';
import { Link } from 'react-router-dom';
import { Inode } from '../../lib/db';

const TruncatedText: React.FC<{ maxWidth?: number, tooltip?: string, children: any }> = ({ tooltip, children, maxWidth = 80 }) => (
  <div style={{ textOverflow: 'ellipsis', maxWidth, overflowX: 'hidden' }} title={tooltip}>
    {children}
  </div>
);

@inject('store')
@observer
class EnsResolver extends React.Component<{ address: string, store?: RootStore }> {
  componentDidUpdate(prevProps: Readonly<{ address: string; store: RootStore }>) {
    if (prevProps.address !== this.props.address) {
      this.props.store!.ensStore.resolveName(this.props.address);
    }
  }

  componentDidMount(): void {
    this.props.store!.ensStore.resolveName(this.props.address);
  }

  render() {
    const { address, store } = this.props;

    const { isLoading: { [ address ]: isLoading }, ensNames: { [ address ]: name } } = store!.ensStore;

    return <span style={{ color: isLoading ? 'slategray' : void 0 }}>{name || address}</span>;
  }
}

const columns: ColumnProps<Inode>[] = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    render: (title: string, record) => {
      return <Link to={`/file/${record.id}`}>{title}</Link>;
    }
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category'
  },
  {
    title: 'File Type',
    dataIndex: 'mimeType',
    key: 'fileType'
  },
  {
    title: 'File Size',
    dataIndex: 'sizeBytes',
    key: 'fileSize',
    render: (size: number) => {
      return filesize(size);
    }
  },
  {
    title: 'Author',
    key: 'author',
    dataIndex: 'author',
    render: (author) => {
      return (
        <TruncatedText tooltip={author}>
          <EnsResolver address={author}/>
        </TruncatedText>
      );
    }
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
    const prevQuery = prevQueryParams.get('q');

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
      return this.inodeStore.getLatest({ page: this.state.currPage });
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
    return queryParams.get('q');
  }

  public render() {
    return (
      <div className="Search-results">
        <div className="Table-container">
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
