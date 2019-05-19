import React, { useState } from 'react';
import { Form, Input, Typography } from 'antd';

interface UploadFormValue {
  title: string;
  description: string;
  category: string;
}

const defaultValue: UploadFormValue = {
  title: '',
  description: '',
  category: ''
};

const UploadForm = ({ value, onChange }: { value: UploadFormValue, onChange: (value: UploadFormValue) => void }) => {
  return (
    <Form>
      <Form.Item label="Title">
        <Input value={value.title} onChange={e => onChange({ ...value, title: e.target.value })}
               placeholder="Title"/>
      </Form.Item>
      <Form.Item label="Description">
        <Input.TextArea value={value.description} onChange={e => onChange({ ...value, title: e.target.value })}
                        placeholder="Description"/>
      </Form.Item>

      <Form.Item label="Category">
        <Input value={value.category} onChange={e => onChange({ ...value, category: e.target.value })}
               placeholder="Category"/>
      </Form.Item>
    </Form>
  );
};

export function Upload() {
  const [ formValue, setFormValue ] = useState<UploadFormValue>(defaultValue);

  return (
    <div>
      <Typography.Title level={2}>Upload a file</Typography.Title>
      <UploadForm value={formValue} onChange={setFormValue}/>
    </div>
  );
}

