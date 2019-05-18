import React, { Component } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Download, Search, SearchResults, Upload } from "./Components/";
import "./App.css";

import { Typography } from "antd";

const { Title } = Typography;

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Title>ETHNYC Tracker</Title>
        </div>
        <div className="App-content">
          <Router>
            <Switch>
              <Route path="/" component={Search} exact />
              <Route path="/search" component={SearchResults} exact />
              <Route path="/file/:id" render={() => "File!"} />
            </Switch>
          </Router>
          {/* <GetResults /> */}
          {/* <Download />
          <Upload /> */}
        </div>
      </div>
    );
  }
}

export default App;
