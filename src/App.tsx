import React, { Component } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Download, SearchResults, UploadForm } from "./Components";
import "./App.css";
import { RootStore } from "./store/rootStore";
import { observer, Provider } from "mobx-react";
import AppHeader from "./Components/AppHeader/AppHeader";
import HomePage from "./Components/HomePage/HomePage";

@observer
class App extends Component {
  private store = new RootStore();

  render() {
    return (
      <Provider store={this.store}>
        <Router>
          <div className="container">
            <Route component={AppHeader} />

            <main>
              <Switch>
                <Route path="/" component={HomePage} exact />
                <Route path="/search" component={SearchResults} exact />
                <Route path="/file/:id" component={Download} exact />
                <Route path="/upload" component={UploadForm} exact />
              </Switch>
            </main>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
