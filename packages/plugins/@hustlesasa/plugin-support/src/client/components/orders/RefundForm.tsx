import React from 'react';
import { useAPIClient } from '@nocobase/client';
import { Form } from 'antd';

interface Values {
  reason: string;
}

const RefundForm = ({ selectedItem, dom, setOpen, message, setConfirmLoading }) => {
  const api = useAPIClient();
  const [form] = Form.useForm();

  /**
   * methods
   */

  const onCreate = async (values: Values) => {
    setConfirmLoading(true);
    try {
      const response = await api.request({
        url: `orders:refund`,
        method: 'POST',
        params: {
          order: selectedItem.id,
          reason: values.reason,
        },
      });

      if (response?.data?.['data']) {
        message.success('Order refunded');
      }
    } catch (error) {
      message.error(error.message || 'Failed to refund order, try again!');
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
};

export default RefundForm;
