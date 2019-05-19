import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Icon, Input } from 'antd';
import { Search } from 'history';
import { ReactComponent as NachoLogo } from '../../svg/nacho.svg';
import './AppHeader.css';

function parseSearch(search: Search): string {
  return new URLSearchParams(search).get('q') || '';
}

interface TitleBarProps {
  onClick(): void;
}

const TitleBar: React.FC<TitleBarProps> = props => (
  <div style={{ display: 'flex', padding: 12, alignItems: 'center' }}>
    <div className="AppHeader-title" onClick={props.onClick}>
      <NachoLogo className="AppHeader-title-logo" />
      NachoFiles
    </div>

    <div style={{ flexShrink: 0 }}>
      <a
        href="https://github.com/ethny-tracker/"
        rel="noreferrer noopener"
        target="_blank"
      >
        <Button size="large" type="link" ghost>
          <Icon type="github" style={{ fontSize: '43px' }}/>
        </Button>
      </a>
    </div>
  </div>
);

const excludedRoutes = [ '/', '/upload' ];

const AppHeader = ({ location, history }: RouteComponentProps) => {
  if (excludedRoutes.indexOf(location.pathname) !== -1) {
    return null;
  }

  return (
    <header style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        <TitleBar onClick={() => history.push('/')}/>
        <div>
          <Input.Search
            placeholder="Search for a file..."
            size="large"
            defaultValue={parseSearch(location.search)}
            onSearch={e => history.push(`/search?q=${e}`)}
          />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
export { TitleBar };
