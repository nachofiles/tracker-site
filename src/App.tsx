import React, { Component } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Download, Search, SearchResults, Upload } from "./Components/";
import "./App.css";

import { Typography, Button, Icon } from "antd";
import { RootStore } from "./store/rootStore";
import { observer, Provider } from "mobx-react";

const { Title } = Typography;

@observer
class App extends Component {
  private store = new RootStore();
  render() {
    return (
      <Provider store={this.store}>
        <div className="App">
          <div className="App-header">
            ETHNYC TRACKER
            <div className="App-links">
              <a
                href="https://github.com/ethny-tracker/ethny"
                rel="noreferrer"
                target="_blank"
              >
                <Button size="large" type="link" ghost>
                  <Icon type="github" style={{ fontSize: "50px" }} />
                </Button>
              </a>
            </div>
          </div>
          <div className="App-content">
            <Router>
              <Switch>
                <Route path="/" component={Search} exact />
                <Route path="/search" component={SearchResults} exact />
                <Route path="/file/:id" render={() => "File!"} />
                <Route path="/download" component={Download} exact />
              </Switch>
            </Router>
            {/* <GetResults /> */}
            {/* <Download />
          <Upload /> */}
          </div>
        </div>
      </Provider>
    );
  }
}

export default App;
