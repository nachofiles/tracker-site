import React, { Component } from "react";
import { RouteComponentProps } from 'react-router';
import "./Search.css";
import { Input } from "antd";

const SearchBar = Input.Search;


export class Search extends Component<RouteComponentProps> {
  public handleSearch = (value: string) => {
    this.props.history.push(`/search?query=${value}`);
  };

  render() {
    return (
      <div className="Search-content">
        <SearchBar
          placeholder="Search for a file.."
          enterButton="Search"
          size="large"
          style={{ width: 700 }}
          onSearch={e => this.handleSearch(e)}
        />
      </div>
    );
  }
}
