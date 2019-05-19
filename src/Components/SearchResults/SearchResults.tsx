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
import EnsResolver, { TruncatedText } from '../EnsResolver/EnsResolver';

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
        <TruncatedText tooltip={author} maxWidth={130}>
          <EnsResolver address={author}/>
        </TruncatedText>
      );
    }
  },
  {
    title: 'Created at',
    key: 'createdAt',
    dataIndex: 'createdAt',
    render: (createdAt) => {
      return (
        <span>{new Date(createdAt).toLocaleString()}</span>
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
