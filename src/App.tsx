import React, { Component } from 'react';
import {Download, Search, GetResults, Upload } from './Components/'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Search />
        <GetResults />
        <Download />
        <Upload />
        
      </div>
    );
  }
}

export default App;