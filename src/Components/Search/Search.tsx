import React from "react";
import "./Search.css";

import { Input } from "antd";

const SearchBar = Input.Search;

export function Search() {
  return (
    <div className="Search-content">
      <SearchBar
        placeholder="Search for a file.."
        enterButton="Search"
        size="large"
        style={{ width: 700 }}
        onSearch={value => console.log(value)}
      />
    </div>
  );
}
