import React from "react";
import { Button, Form, Input } from "antd";
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

const UploadForm = ({
  disabled,
  value,
  onChange
}: {
  disabled: boolean;
  value: UploadFormValue;
  onChange: (value: UploadFormValue) => void;
}) => {
  return (
    <Form>
      <Form.Item label="Title">
        <Input
          value={value.title}
          disabled={disabled}
          onChange={e => onChange({ ...value, title: e.target.value })}
          placeholder="Title"
        />
      </Form.Item>
      <Form.Item label="Description">
        <Input.TextArea
          value={value.description}
          disabled={disabled}
          onChange={e => onChange({ ...value, description: e.target.value })}
          placeholder="Description"
        />
      </Form.Item>
      <Form.Item label="IPFS hash">
        <Input
          disabled={disabled}
          value={value.ipfsHash}
          onChange={e => onChange({ ...value, ipfsHash: e.target.value })}
          placeholder="IPFS Hash"
        />
      </Form.Item>
    </Form>
  );
};

@inject("store")
@observer
export class Upload extends React.Component<
  { store: RootStore },
  { uploadFormValue: UploadFormValue }
> {
  state = {
    uploadFormValue: defaultValue
  };

  private handleChange = (uploadFormValue: UploadFormValue) => {
    this.setState({ uploadFormValue });
  };

  private handleUpload = () => {
    console.log("i was clicked");
  };

  upload = () => {
    const {
      title,
      description,
      category,
      ipfsHash
    } = this.state.uploadFormValue;

    this.props.store.inode.createInode({
      title,
      description,
      category,
      uri: "ipfs://" + ipfsHash
    });
  };

  render() {
    const { creating, createError } = this.props.store.inode;
    const { uploadFormValue } = this.state;

    return (
      <div className="Upload-container">
        <div className="Upload-title"> Upload Your File</div>
        <div className="Upload-form-container">
          <div className="Upload-form">
            <UploadForm
              disabled={creating}
              value={uploadFormValue}
              onChange={this.handleChange}
            />
            {createError !== null ? <div>{createError.message}</div> : null}
            <Button
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
