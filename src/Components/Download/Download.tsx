import { Typography, Button, Tag } from "antd";
import React from "react";
import "./Download.css";
import { RouteComponentProps } from "react-router";

const { Title } = Typography;

interface Props extends RouteComponentProps<{ id: string }> {
  title: string;
  created: string;
  author: string;
  description: string;

  fileType: string;
  fileSize: string;
  id: string;
  category: string;
}

export class Download extends React.Component<Props> {
  componentDidMount() {
    const { id } = this.props.match.params;
  }

  public render() {
    return (
      <div className="Download-container">
        <div className="Download-content">
          <div className="Download-header">
            <div className="Download-title">
              <Title level={2}>{this.props.title}</Title>
            </div>
            <div className="Download-title-specs">
              <div className="Download-header-created">
                Created: {this.props.created}
                <div className="Download-author">{this.props.author}</div>
              </div>
            </div>
          </div>
          <div className="Download-body">
            {" "}
            <div className="Download-description">{this.props.description}</div>
            <div className="Download-footer">
              {" "}
              <Tag color="volcano">{this.props.category}</Tag>
              <Tag color="magenta">{this.props.fileType}</Tag>{" "}
              <Tag color="green">{this.props.fileSize}</Tag>
              <Tag color="purple"> ID: {this.props.id}</Tag>
            </div>
          </div>
          <div className="Download-button">
            {" "}
            <Button type="primary" shape="round" icon="download" block>
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
