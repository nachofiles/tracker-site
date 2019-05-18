import React, { Component } from "react";
import "./Search.css";

import { Input } from "antd";

const SearchBar = Input.Search;

interface Props {
  searchValue: string;
}

interface State {
  returnResults?: boolean;
}

export class Search extends Component<State> {
  public state = {
    returnResults: false
  };
  // this.handleSearch = this.handleSearch.bind(this);

  public handleSearch = (e: any) => {
    this.setState({ returnResults: true });
    console.log(e);
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
          // onSearch={this.handleSearch}
        />
      </div>
    );
  }
}
