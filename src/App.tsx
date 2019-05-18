import React, { Component } from "react";
import { Download, Search, GetResults, Upload } from "./Components/";
import "./App.css";

import { Typography } from "antd";

const { Title } = Typography;

class App extends Component {
  state = { searchTerm: "" };

  public getSearchResults() {
    return <GetResults />;
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Title>ETHNYC Tracker</Title>
        </div>
        <div className="App-content">
          <Search
            onSearchQuery={searchQuery =>
              console.log("the search query result is:", searchQuery)
            }
          />
          {/* <GetResults /> */}
          {/* <Download />
          <Upload /> */}
        </div>
      </div>
    );
  }
}

export default App;
