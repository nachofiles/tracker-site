import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Input } from 'antd';
import { TitleBar } from '../AppHeader/AppHeader';
import { Link } from 'react-router-dom';

const HomePage = (props: RouteComponentProps) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: 800, padding: 20 }}>
        <div>
          <TitleBar onClick={() => props.history.push('/')}/>
        </div>
        <Input.Search
          size="large"
          placeholder="Search for a file..."
          onSearch={e => props.history.push(`/search?q=${e}`)}/>
        <div style={{ padding: 12 }}>
          <Link to="/upload">Upload files</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;