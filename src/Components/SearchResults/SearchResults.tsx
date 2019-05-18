import React from "react";
import { RouteComponentProps } from "react-router";
import { Table, Divider, Tag } from "antd";
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

export class SearchResults extends React.Component<RouteComponentProps> {
  render() {
    const params = new URLSearchParams(this.props.location.search);

    return (
      <div className="Table-container">
        <div className="Table-content">
          Searching for {params.get("query")}!
          <Table columns={columns} dataSource={data} />
        </div>
      </div>
    );
  }
}
