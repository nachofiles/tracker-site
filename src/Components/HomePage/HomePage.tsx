import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Input, Popconfirm } from 'antd';
import { TitleBar } from '../AppHeader/AppHeader';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { RootStore } from '../../store/rootStore';
import './HomePage.css';

interface Props extends RouteComponentProps {
  store: RootStore;
}

@inject('store')
@observer
class HomePage extends React.Component<Props> {
  private clearDb = async () => {
    await this.props.store.fileMetadata.clear();
    window.location.reload();
  };

  render() {
    const { fileMetadata } = this.props.store;

    let syncText;
    if (fileMetadata.syncError) {
      syncText = <span className="error">{fileMetadata.syncError.message}</span>;
    } else if (fileMetadata.totalInodesToSync === Infinity) {
      syncText = '';
    } else if (fileMetadata.inodesSynced === fileMetadata.totalInodesToSync) {
      syncText = 'Fully synced!';
    } else {
      syncText = `Synced ${fileMetadata.inodesSynced} of ${fileMetadata.totalInodesToSync}`;
    }

    return (
      <div className="HomePage-container">
        <div style={{ width: '100%', maxWidth: 800, padding: 20 }}>
          <div>
            <TitleBar onClick={() => this.props.history.push('/')}/>
          </div>
          <Input.Search
            className="HomePage-search"
            size="large"
            placeholder="Search for a file..."
            onSearch={e => this.props.history.push(`/search?q=${e}`)}
          />
          <div className="HomePage-details">
            <ul className="link-list">
              <li>
                <Link to="/search?q=">Browse files</Link>
              </li>
              <li>
                <Link to="/upload">Upload file</Link>
              </li>
              <li>
                <Popconfirm title="Reset file database?" onConfirm={this.clearDb}>
                  Reset database
                </Popconfirm>
              </li>
            </ul>
            <div className={`HomePage-sync ${syncText ? '' : 'is-hidden'}`}>
              {syncText}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default HomePage;
