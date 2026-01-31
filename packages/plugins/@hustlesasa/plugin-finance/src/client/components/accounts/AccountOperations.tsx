import React, { useState } from 'react';
import { Card, Form, Input, Button, Flex, Modal, InputNumber, message } from 'antd';
import { ExclamationCircleFilled, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

interface Values {
  amount: number;
  reason: string;
  payment_ref: string;
}

function AccountOperations({ hustle }: any) {
  const api = useAPIClient();
  const [form] = Form.useForm();

  /**
   * states
   */
  const showDebitConfirm = async (values: Values) => {
    Modal.confirm({
      title: `You are about to DEBIT Account #${hustle?.account} an amount of ${values.amount}. Are you sure you want to continue?`,
      icon: <ExclamationCircleFilled />,
      async onOk() {
        try {
          const response = await api.request({
            url: `finance:debit`,
            method: 'POST',
            params: {
              hustle: hustle.shop_id,
              amount: values.amount,
              payment_ref: values.payment_ref,
              reason: values.reason,
            },
          });

          if (response?.data?.['data']) {
            message.success(response?.data?.['data']?.message);
          }
        } catch (error) {
          message.error(error.message || 'Failed to debit account, try again!');
        } finally {
          form.resetFields();
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const showCreditConfirm = (values: Values) => {
    Modal.confirm({
      title: `You are about to CREDIT Account #${hustle?.account} an amount of ${values.amount}. Are you sure you want to continue?`,
      icon: <ExclamationCircleFilled />,
      async onOk() {
        try {
          const response = await api.request({
            url: `finance:credit`,
            method: 'POST',
            params: {
              hustle: hustle.shop_id,
              amount: values.amount,
              payment_ref: values.payment_ref,
              reason: values.reason,
            },
          });

          if (response?.data?.['data']) {
            message.success(response?.data?.['data']?.message);
          }
        } catch (error) {
          message.error(error.message || 'Failed to credit account, try again!');
        } finally {
          form.resetFields();
        }
      },
      onCancel() {},
    });
  };

  return (
    <Card title="Account operations">
      <Form
        method="POST"
        name="wrap"
        size="middle"
        labelCol={{ flex: '20%' }}
        labelAlign="left"
        labelWrap
        form={form}
        wrapperCol={{ flex: 1 }}
        colon={false}
      >
        <Form.Item
          label="Credit / Debit amount"
          name="amount"
          rules={[{ required: true, message: 'Enter the amount' }]}
        >
          <InputNumber suffix={`${hustle?.country?.currencyCode}` || 'RMB'} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Reason for transaction"
          name="reason"
          rules={[{ required: true, message: 'Reason for transaction is required' }]}
        >
          <Input placeholder="Enter value" />
        </Form.Item>

        <Form.Item label="3rd Party Reference" name="payment_ref">
          <Input placeholder="Enter value" />
        </Form.Item>

        <Form.Item label=" ">
          <Flex justify="flex-end" gap="middle">
            <Button
              size="middle"
              htmlType="button"
              icon={<MinusCircleOutlined />}
              onClick={() => form.validateFields().then((values) => showDebitConfirm(values))}
            >
              Debit
            </Button>

            <Button
              size="middle"
              type="primary"
              htmlType="submit"
              icon={<PlusCircleOutlined />}
              onClick={() => form.validateFields().then((values) => showCreditConfirm(values))}
            >
              Credit
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default AccountOperations;
