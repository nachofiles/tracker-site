import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Icon, Input } from 'antd';
import { Search } from 'history';

function parseSearch(search: Search): string {
  return new URLSearchParams(search).get('q') || '';
}

const TitleBar = (props: { onClick: () => void }) => (
  <div style={{ display: 'flex', padding: 12 }}>
    <div style={{
      margin: 0,
      padding: 0,
      flexGrow: 1,
      font: '"Julius Sans One", sans-serif',
      fontSize: 42,
      cursor: 'pointer'
    }} onClick={props.onClick}>
      ETHNYC TRACKER
    </div>
    <div style={{ flexShrink: 0 }}>
      <a href="https://github.com/ethny-tracker/" rel="noreferrer" target="_blank">
        <Button size="large" type="link" ghost>
          <Icon type="github" style={{ fontSize: '50px' }}/>
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