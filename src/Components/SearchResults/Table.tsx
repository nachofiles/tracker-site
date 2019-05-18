import React from "react";
import { RouteComponentProps } from 'react-router';
import "./Table.css";

export class SearchResults extends React.Component<RouteComponentProps> {
  render() {
    const params = new URLSearchParams(this.props.location.search);

    return <div>Searching for {params.get('query')}!</div>;
  }
}
