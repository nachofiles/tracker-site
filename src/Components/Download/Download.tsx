import { Typography, Button } from "antd";
import React from "react";
import "./Download.css";

const { Title } = Typography;

export function Download() {
  return (
    <div className="Download-container">
      <div className="Download-content">
        <div className="Download-header">
          <div className="Download-title">
            <Title level={2}>Education PDF</Title>
          </div>
          <div className="Download-title-specs">
            <div className="Download-header-created">
              Created: May, 28, 2019
            </div>
          </div>
        </div>
        <div className="Download-sub-header">
          <div className="Download-category">
            <Title level={4}>Educational Content</Title>
          </div>
        </div>
        <div className="Download-body">
          {" "}
          <div className="Download-description">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content
            here', making it look like readable English. Many desktop publishing
            packages and web page editors now use Lorem Ipsum as their default
            model text, and a search for 'lorem ipsum' will uncover many web
            sites still in their infancy.{" "}
          </div>
          <div className="Download-footer">
            <div className="Download-author">ANON</div>

            <div className="Download-file-type">PDF</div>
            <div className="Download-file-size">183649q8</div>
          </div>
          <div className="Download-id">
            ID: qETKm0D$73%1&jf6vPvaM9iMV9jPIpvnq&ii^F(YP1au4DjNpRmuCtbIl6jvwrVu
          </div>
          <Button type="primary" shape="round" icon="download" block>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
