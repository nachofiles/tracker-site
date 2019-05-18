import React from "react";
import { RouteComponentProps } from "react-router";
import "./Table.css";
import { inject, observer } from "mobx-react";
import { RootStore } from "../../store/rootStore";

type Props = RouteComponentProps & { store: RootStore };

@inject("store")
@observer
export class SearchResults extends React.Component<Props> {
  componentDidMount() {
    this.props.store.inode.getLatest({ page: 1 });
  }
  render() {
    const params = new URLSearchParams(this.props.location.search);
    return (
      <div>
        Searching for {params.get("query")}!
        {JSON.stringify(this.props.store.inode.searchResults)}
      </div>
    );
  }
}
