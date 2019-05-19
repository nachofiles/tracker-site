import React from "react";
import { Button, Form, Input, Alert, Upload, Icon, Select } from "antd";
import { inject, observer } from "mobx-react";
import { RootStore } from "../../store/rootStore";
import "./Upload.css";

interface UploadFormValue {
  title: string;
  date: string;
  author: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: number;
  id: string;
  ipfsHash: string;
}

const defaultValue: UploadFormValue = {
  title: "",
  date: "",
  author: "",
  description: "",
  category: "",
  fileSize: 0,
  fileType: "",
  id: "",
  ipfsHash: ""
};

const Option = Select.Option;

interface Props {
  store: RootStore;
}

interface State {
  uploadFormValue: UploadFormValue;
  isShowingHash: boolean;
}

@inject("store")
@observer
export class UploadForm extends React.Component<Props, State> {
  state = {
    uploadFormValue: defaultValue,
    isShowingHash: false
  };

  private handleChange = (uploadFormValue: UploadFormValue) => {
    this.setState({ uploadFormValue });
  };

  private toggleFileHash = () => {
    this.setState({ isShowingHash: !this.state.isShowingHash });
  };

  private handleFileUpload = (file: File) => {
    this.props.store.upload.uploadFileData(file);
    return false;
  };

  private handleUpload = () => {
    this.props.store.upload.uploadFileMetadata(this.state.uploadFormValue);
  };

  upload = () => {
    const {
      title,
      description,
      category,
      ipfsHash
    } = this.state.uploadFormValue;

    this.props.store.upload.uploadFileMetadata({
      title,
      description,
      category,
      uri: "ipfs://" + ipfsHash
    });
  };

  render() {
    const { upload } = this.props.store;
    const { isUploadingMetadata, uploadMetadataError } = upload;
    const { uploadFormValue: value, isShowingHash } = this.state;

    return (
      <div className="Upload-container">
        <div className="Upload-title">Upload Your File</div>
        <div className="Upload-form-container">
          <div className="Upload-form">
            <Form layout="vertical">
              <Form.Item label="Title">
                <Input
                  value={value.title}
                  disabled={isUploadingMetadata}
                  onChange={e =>
                    this.handleChange({ ...value, title: e.target.value })
                  }
                  placeholder="Title"
                  size="large"
                />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea
                  value={value.description}
                  disabled={isUploadingMetadata}
                  onChange={e =>
                    this.handleChange({ ...value, description: e.target.value })
                  }
                  placeholder="Description"
                />
              </Form.Item>
              <Form.Item label="Category">
                <Select
                  showSearch
                  placeholder="Select a category"
                  optionFilterProp="children"
                >
                  <Option value="Document">Document</Option>
                  <Option value="Audio">Audio</Option>
                  <Option value="Video">Video</Option>
                  <Option value="Application">Application</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>

              {isShowingHash ? (
                <Form.Item label="IPFS Hash">
                  <Input
                    disabled={isUploadingMetadata}
                    value={value.ipfsHash}
                    onChange={e =>
                      this.handleChange({ ...value, ipfsHash: e.target.value })
                    }
                    placeholder="IPFS Hash"
                  />
                </Form.Item>
              ) : (
                <Form.Item label="Upload a File">
                  <Upload.Dragger
                    showUploadList={false}
                    beforeUpload={this.handleFileUpload}
                    disabled={upload.isUploadingFileData}
                  >
                    <p className="ant-upload-drag-icon">
                      <Icon
                        type={
                          upload.isUploadingFileData
                            ? "loading"
                            : value.ipfsHash
                            ? "check-circle"
                            : "inbox"
                        }
                      />
                    </p>
                    <p className="ant-upload-text">Upload a File</p>
                    <p className="ant-upload-hint">
                      File must be less than 50mb
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              )}
            </Form>
            {uploadMetadataError && (
              <Alert
                type="error"
                message="Something went wrong"
                description={uploadMetadataError.message}
              />
            )}
            <Button
              size="large"
              type="primary"
              shape="round"
              icon="upload"
              block
              onClick={this.handleUpload}
            >
              Upload Your File
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
