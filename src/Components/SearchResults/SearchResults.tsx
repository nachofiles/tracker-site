import React from "react";
import { RouteComponentProps } from "react-router";
import { Table, Divider, Tag, Button } from "antd";
import "./SearchResults.css";

const columns = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category"
  },
  {
    title: "File Type",
    dataIndex: "fileType",
    key: "fileType"
  },
  {
    title: "Fize Size",
    key: "fileSize",
    dataIndex: "fileSize"
  },
  {
    title: "Author",
    key: "author",
    dataIndex: "author"
  }
];

const data = [
  {
    key: "1",
    title: "John Brown",
    category: "Education",
    fileSize: 32,
    fileType: "New York No. 1 Lake Park",
    author: "me"
  }
];

interface State {
  searchComplete: boolean;
}

export class SearchResults extends React.Component<RouteComponentProps> {
  public state: State = {
    searchComplete: false
  };

  public getLatest() {}

  render() {
    const params = new URLSearchParams(this.props.location.search);

    return (
      <div className="Table-container">
        <div className="Table-content">
          {/* {if (this.state)} */}
          Searching for {params.get("query")}!
          <div className="Table-header">
            <div className="Table-buttons">
              <Button type="primary" onClick={this.getLatest}>
                Get Latest
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            // onRowClick={this.handleRowClick}
          />
        </div>
      </div>
    );
  }
}
