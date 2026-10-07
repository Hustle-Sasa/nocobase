import React, { useState } from 'react';
import { useAPIClient, useRequest } from '@nocobase/client';
import { useEnvironment } from '../(shared)/use-environment-settings';
import { Button, Form, Input, message, Modal, Select } from 'antd';
import { startCase } from 'lodash';

interface PlatformUser {
  id: number;
  name: string;
  email?: string;
}

interface Values {
  oldPhoneNumber: string;
  newPhoneNumber: string;
  requestedBy: number[];
  reason: string;
}

interface ChangePhoneNumberFormProps {
  open: boolean;
  ticketId?: string;
  phoneNumber?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePhoneNumberForm: React.FC<ChangePhoneNumberFormProps> = ({
  open,
  ticketId,
  phoneNumber,
  onClose,
  onSuccess,
}) => {
  /**
   * state
   */
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const api = useAPIClient();
  const environment = useEnvironment();

  /**
   * api
   */
  const { data: response, loading: usersLoading } = useRequest<{ data: { data: PlatformUser[] } }>(
    { url: 'orders:listPlatformUsers' },
    { ready: open, refreshDeps: [open] },
  );

  const users = response?.data?.['data'] || [];

  /**
   * methods
   */
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: Values) => {
    if (!ticketId) {
      message.error('Ticket ID is missing');
      return;
    }

    setLoading(true);
    try {
      await api.request({
        url: 'orders:changePhoneNumber',
        method: 'POST',
        params: {
          order_reference: ticketId,
          env: environment,
          old_phone_number: values.oldPhoneNumber,
          new_phone_number: values.newPhoneNumber,
          requested_by: values.requestedBy,
          reason: values.reason,
        },
      });

      message.success('Phone number updated');
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message;
      message.error(errorMsg || error.message || 'Failed to change phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Change buyer's phone number" open={open} onCancel={handleCancel} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleFinish} preserve={false}>
        <Form.Item
          label="Old phone number"
          name="oldPhoneNumber"
          initialValue={phoneNumber}
          rules={[{ required: true, message: 'Old phone number is required' }]}
        >
          <Input placeholder="Enter old phone number" />
        </Form.Item>

        <Form.Item
          label="New phone number"
          name="newPhoneNumber"
          rules={[
            { required: true, message: 'New phone number is required' },
            { pattern: /^\+?\d{9,15}$/, message: 'Enter a valid phone number e.g. 254712345678' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || value !== getFieldValue('oldPhoneNumber')) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('New phone number must differ from the old one'));
              },
            }),
          ]}
        >
          <Input placeholder="Enter new phone number" />
        </Form.Item>

        <Form.Item
          label="Requested by"
          name="requestedBy"
          rules={[{ required: true, type: 'array', min: 1, message: 'Please select who requested the change' }]}
        >
          <Select
            mode="multiple"
            allowClear
            loading={usersLoading}
            placeholder="Select users"
            optionFilterProp="label"
            options={users.map((user) => ({
              value: user.id,
              label: user.name.includes('@') ? user.name : startCase(user.name),
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: 'Please enter the reason for this change' }]}
        >
          <Input.TextArea rows={4} placeholder="Why is the phone number being changed?" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Change phone number
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePhoneNumberForm;
