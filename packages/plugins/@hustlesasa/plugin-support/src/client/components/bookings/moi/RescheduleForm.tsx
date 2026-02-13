import React, { useState } from 'react';
import { useAPIClient } from '@nocobase/client';
import { Button, DatePicker, Form, message, Modal, TimePicker } from 'antd';
import dayjs from 'dayjs';

interface RescheduleFormProps {
  open: boolean;
  variantId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RescheduleForm: React.FC<RescheduleFormProps> = ({ open, variantId, onClose, onSuccess }) => {
  /**
   * state
   */
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const api = useAPIClient();

  /**
   * methods
   */
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: { date: any; time: any }) => {
    if (!variantId) {
      message.error('Variant ID is missing');
      return;
    }

    setLoading(true);
    try {
      const date = values.date.format('YYYY-MM-DD');
      const time = values.time.format('HH:mm') + ':00.000000';

      const response = await api.request({
        url: 'bookings:reschedule',
        method: 'POST',
        params: {
          variantId,
          date,
          time,
        },
      });

      message.success(response?.data?.data?.booking || 'Booking has been changed');
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      const errorText = Array.isArray(errorMsg)
        ? errorMsg.join(', ')
        : errorMsg || error.message || 'Failed to reschedule booking';
      message.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Reschedule Booking" open={open} onCancel={handleCancel} footer={null}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Please select a date' }]}>
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item label="Time" name="time" rules={[{ required: true, message: 'Please select a time' }]}>
          <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={20} showSecond={false} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Reschedule
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RescheduleForm;
