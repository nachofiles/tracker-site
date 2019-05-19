import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Input } from 'antd';
import { TitleBar } from '../AppHeader/AppHeader';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = (props: RouteComponentProps) => {
  return (
    <div className="HomePage-container">
      <div style={{ width: '100%', maxWidth: 800, padding: 20 }}>
        <div>
          <TitleBar onClick={() => props.history.push('/')}/>
        </div>
        <Input.Search
          size="large"
          placeholder="Search for a file..."
          onSearch={e => props.history.push(`/search?q=${e}`)}
        />
        <ul className="link-list">
          <li>
            <Link to="/search?q=">Browse files</Link>
          </li>
          <li>
            <Link to="/upload">Upload files</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
