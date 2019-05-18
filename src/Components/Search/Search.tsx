import React, { Component } from "react";
import "./Search.css";

import { Input } from "antd";

const SearchBar = Input.Search;

interface Props {
  onSearchQuery(results: string): void;
}

export class Search extends Component<Props> {
  // this.handleSearch = this.handleSearch.bind(this);

  public handleSearch = (value: string) => {
    this.props.onSearchQuery(value);
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
