import React from 'react';
import { useAPIClient } from '@nocobase/client';
import { Form, message } from 'antd';

interface Values {
  account: string;
}

function AssignAgentForm({ selectedItem, dom, setOpen, setConfirmLoading }) {
  const api = useAPIClient();
  const [form] = Form.useForm();

  /** methods */

  const onCreate = async (values: Values) => {
    setConfirmLoading(true);
    try {
      const response = await api.request({
        url: `operations:assign`,
        method: 'POST',
        params: {
          phone: selectedItem.phone,
          account: values.account,
        },
      });

      if (response?.data?.['data']) {
        message.success('Agent assigned');
      }
    } catch (error) {
      message.error(error.message || 'Failed to assign agent, try again!');
    } finally {
      setConfirmLoading(false);
      form.resetFields();
      setOpen(false);
    }
  };

  return (
    <Form
      method="POST"
      layout="vertical"
      form={form}
      name="form_in_modal"
      onReset={() => form.resetFields()}
      onFinish={(values) => onCreate(values)}
    >
      {dom}
    </Form>
  );
}

export default AssignAgentForm;
