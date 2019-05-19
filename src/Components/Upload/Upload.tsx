import React from 'react';
import { Button, Form, Input, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import { RootStore } from '../../store/rootStore';

interface UploadFormValue {
  title: string;
  description: string;
  category: string;
  ipfsHash: string;
}

const defaultValue: UploadFormValue = {
  title: '',
  description: '',
  category: '',
  ipfsHash: ''
};

const UploadForm = ({ disabled, value, onChange }: { disabled: boolean, value: UploadFormValue, onChange: (value: UploadFormValue) => void }) => {
  return (
    <Form>
      <Form.Item label="Title">
        <Input
          value={value.title}
          disabled={disabled}
          onChange={e => onChange({ ...value, title: e.target.value })}
          placeholder="Title"/>
      </Form.Item>
      <Form.Item label="Description">
        <Input.TextArea
          value={value.description}
          disabled={disabled}
          onChange={e => onChange({ ...value, description: e.target.value })}
          placeholder="Description"/>
      </Form.Item>

      <Form.Item label="Category">
        <Input
          disabled={disabled}
          value={value.category}
          onChange={e => onChange({ ...value, category: e.target.value })}
          placeholder="Category"/>
      </Form.Item>

      <Form.Item label="IPFS hash">
        <Input
          disabled={disabled}
          value={value.ipfsHash}
          onChange={e => onChange({ ...value, ipfsHash: e.target.value })}
          placeholder="IPFS Hash"/>
      </Form.Item>
    </Form>
  );
};


@inject('store')
@observer
export class Upload extends React.Component<{ store: RootStore }, { uploadFormValue: UploadFormValue }> {
  state = {
    uploadFormValue: defaultValue
  };

  handleChange = (uploadFormValue: UploadFormValue) => {
    this.setState({ uploadFormValue });
  };

  upload = () => {
    const { title, description, category, ipfsHash } = this.state.uploadFormValue;

    this.props.store.inode.createInode({
      title,
      description,
      category,
      uri: 'ipfs://' + ipfsHash
    });
  };

  render() {
    return (
      <div style={{ padding: 20 }}>
        <Typography.Title level={2}>Upload a file</Typography.Title>
        <UploadForm
          disabled={this.props.store.inode.creating}
          value={this.state.uploadFormValue}
          onChange={this.handleChange}/>
        <Button
          loading={this.props.store.inode.creating}
          onClick={this.upload}>Upload</Button>
      </div>
    );
  }
}

