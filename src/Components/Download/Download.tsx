import { Typography, Button, Tag, Spin } from "antd";
import React from "react";
import "./Download.css";
import { RouteComponentProps } from "react-router";
import { inject, observer } from "mobx-react";
import { RootStore } from "../../store/rootStore";

const { Title } = Typography;

interface Props extends RouteComponentProps<{ id: string }> {
  store: RootStore;

  title: string;
  created: string;
  author: string;
  description: string;

  fileType: string;
  fileSize: string;
  id: string;
  category: string;
}

@inject("store")
@observer
export class Download extends React.Component<Props> {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.store.download.getFileMetadata(id);
  }

  public render() {
    const downloadStore = this.props.store.download;
    return downloadStore.filemetaData ? (
      <div className="Download-container">
        <div className="Download-content">
          <div className="Download-header">
            <div className="Download-title">
              <Title level={2}>{downloadStore.filemetaData.title}</Title>
            </div>
            <div className="Download-title-specs">
              <div className="Download-header-created">
                Created: {downloadStore.filemetaData.createdAt}
                <div className="Download-author">
                  {downloadStore.filemetaData.author}
                </div>
              </div>
            </div>
          </div>
          <div className="Download-body">
            {" "}
            <div className="Download-description">
              {downloadStore.filemetaData.description}
            </div>
            <div className="Download-footer">
              {" "}
              <Tag color="volcano">{downloadStore.filemetaData.category}</Tag>
              <Tag color="magenta">
                {downloadStore.filemetaData.mimeType}
              </Tag>{" "}
              <Tag color="green">{downloadStore.filemetaData.sizeBytes}</Tag>
              <Tag color="purple"> ID: {downloadStore.filemetaData.id}</Tag>
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
    ) : (
      <Spin />
    );
  }
}
