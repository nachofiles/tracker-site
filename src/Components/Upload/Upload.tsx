import React from "react";
import { Button, Form, Input, Alert, Upload, Icon, Select, message } from "antd";
import { inject, observer } from "mobx-react";
import Long from "long";
import { IFileMetadata } from "@ethny-tracker/tracker-protos";
import { RouteComponentProps } from "react-router";
import { RootStore } from "../../store/rootStore";
import "./Upload.css";

interface UploadFormValue {
  title: string;
  description: string;
  category: string;
  mimeType: string;
  sizeBytes: number;
  ipfsHash: string;
}

const defaultValue: UploadFormValue = {
  title: "",
  description: "",
  category: "",
  sizeBytes: 0,
  mimeType: "",
  ipfsHash: ""
};

const Option = Select.Option;

interface Props extends RouteComponentProps {
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

  private handleFileUpload = async (file: File) => {
    await this.props.store.upload.uploadFileData(file);
    if (this.props.store.upload.fileHash && this.props.store.upload.file) {
      this.handleChange({
        ...this.state.uploadFormValue,
        sizeBytes: this.props.store.upload.file.size,
        mimeType: this.props.store.upload.file.type,
        ipfsHash: this.props.store.upload.fileHash,
      });
    }
    return false;
  };

  private upload = async () => {
    const {
      title,
      description,
      category,
      ipfsHash,
      sizeBytes,
      mimeType,
    } = this.state.uploadFormValue;

    await this.props.store.upload.uploadFileMetadata({
      title,
      description,
      category,
      mimeType,
      sizeBytes: Long.fromNumber(sizeBytes),
      uri: "ipfs://" + ipfsHash,
    } as IFileMetadata);

    if (!this.props.store.upload.uploadMetadataError) {
      message.success('Your file has been listed!');
      this.props.history.push('/');
    }
  };

  render() {
    const { upload } = this.props.store;
    const { isUploadingMetadata, uploadMetadataError } = upload;
    const { uploadFormValue: value, isShowingHash } = this.state;
    const disabled = !value.title || !value.description || !value.ipfsHash || !value.mimeType || !value.category;

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
                  value={value.category}
                  onChange={category => this.handleChange({ ...value, category })}
                  disabled={upload.isUploadingFileData}
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
              onClick={this.upload}
              disabled={disabled}
              loading={upload.isUploadingMetadata}
            >
              Submit Your File
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
