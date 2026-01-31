import React, { useState } from 'react';
import { Card, Flex, Form, Input, Button, Modal, Space, Typography, message } from 'antd';
import {
  CopyOutlined,
  FileExclamationOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

function AdditionalActions({ selectedItem }) {
  /**
   * api
   */
  const api = useAPIClient();

  /**
   * state
   */
  const [form] = Form.useForm();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [regenerate, setRegenerate] = useState(false);

  /**
   * constants
   */
  const isPaystack = selectedItem?.payment_method_id === 'KE_BUYER_PAYSTACK_MOMO_PAYMENT';
  const canShowVerifyPayment = isPaystack && selectedItem?.status === 'PAYMENT_PROCESSING';
  const canRegenerateTicket = ['PAYMENT_COMPLETED', 'DELIVERED'].includes(selectedItem?.status);
  const checkoutUrl = `https://purchase.hustlesasa.shop/checkout/${selectedItem.order_reference}`;

  /**
   * methods
   */
  const handleSubmit = async (values: { transactionRef: string; orderRef: string; amount: string }) => {
    try {
      const response = await api.request({
        url: `orders:verifyPayment`,
        method: 'POST',
        params: {
          transaction_reference: values.transactionRef,
          order_reference: values.orderRef,
          amount: values.amount,
        },
      });

      if (response?.data?.['data']) {
        message.success('Payment verified');
      }
    } catch (error) {
      message.error(error.message || 'Failed to verify payment, try again!');
    } finally {
      form.resetFields();
      setVerifyModalOpen(false);
    }
  };

  const regenerateTicket = async () => {
    const id = selectedItem?.id;

    setRegenerate(true);

    try {
      const response = await api.request({
        url: `orders:regenerate`,
        params: {
          order_id: id,
        },
      });

      if (response?.data?.data?.['data']) {
        setRegenerate(false);
        message.success('Ticket regenerated!');
      }
    } catch (error) {
      message.error('Failed to regenerate ticket');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            Frequently asked actions
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Quick answers to issues that may arise when working on call.
          </Typography.Paragraph>
        </div>

        <Card>
          <Flex gap={16} align="flex-start">
            <InfoCircleOutlined style={{ fontSize: 20, color: '#00cc99', marginTop: 4 }} />
            <div>
              <Typography.Title level={4} style={{ marginBottom: 8 }}>
                What is the order reference?
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Share this reference when you need to identify the transaction quickly.
              </Typography.Paragraph>
              <Typography.Paragraph strong style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{selectedItem?.order_reference || '-'}</span>{' '}
                {selectedItem?.order_reference ? (
                  <Button
                    icon={<CopyOutlined />}
                    type="link"
                    style={{ padding: 0, marginBottom: 0 }}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedItem.order_reference);
                      message.success('Order reference copied');
                    }}
                  >
                    Copy
                  </Button>
                ) : null}
              </Typography.Paragraph>
            </div>
          </Flex>
        </Card>

        <Card>
          <Flex gap={16} align="flex-start">
            <LinkOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />
            <div>
              <Typography.Title level={4} style={{ marginBottom: 8 }}>
                How do I open the checkout page again?
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
                Use the link below to revisit the checkout session and confirm the checkout details.
              </Typography.Paragraph>
              <Button
                type="link"
                style={{ paddingLeft: 0 }}
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to checkout
              </Button>
            </div>
          </Flex>
        </Card>

        {canRegenerateTicket && (
          <>
            <Card>
              <Flex gap={16} align="flex-start">
                <FileExclamationOutlined style={{ fontSize: 20, color: '#fa8c16', marginTop: 4 }} />
                <div>
                  <Typography.Title level={4} style={{ marginBottom: 8 }}>
                    Ticket download shows an error or XML file
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
                    Sometimes browsers try to render the ticket as XML or block the download. Ask the buyer to save the
                    file to their device, then open it with a PDF reader. If it still fails, resend or regenerate the
                    ticket using the actions below.
                  </Typography.Paragraph>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    • Click regenerate ticket below to produce a fresh copy.
                    <br />
                    • Share the regenerated link or ticket to customer support or on the jira ticket.
                    <br />• If the XML view persists, escalate to engineering with the order reference.
                  </Typography.Paragraph>
                </div>
              </Flex>
            </Card>

            <Card>
              <Flex gap={16} align="flex-start">
                <QrcodeOutlined style={{ fontSize: 20, color: '#722ed1', marginTop: 4 }} />
                <div>
                  <Typography.Title level={4} style={{ marginBottom: 8 }}>
                    Need to regenerate the ticket?
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
                    If the ticket is not showing up on the download page, you can regenerate it by clicking the button
                    below.
                  </Typography.Paragraph>
                  <Button type="primary" loading={regenerate} onClick={() => regenerateTicket()}>
                    Regenerate ticket
                  </Button>
                </div>
              </Flex>
            </Card>
          </>
        )}

        {canShowVerifyPayment && (
          <Card>
            <Flex gap={16} align="flex-start">
              <SafetyCertificateOutlined style={{ fontSize: 20, color: '#13c2c2', marginTop: 4 }} />
              <Flex vertical gap={16} align="flex-start" style={{ flex: 1 }}>
                <div>
                  <Typography.Title level={4} style={{ marginBottom: 4 }}>
                    How do I verify the payment manually?
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    System did not verify the payment? Click this button and verify the payment details manually.
                  </Typography.Paragraph>
                </div>

                <Button type="primary" onClick={() => setVerifyModalOpen(true)}>
                  Verify payment
                </Button>
              </Flex>
            </Flex>

            <Modal
              title="Verify MPESA payment manually"
              open={verifyModalOpen}
              onCancel={() => {
                setVerifyModalOpen(false);
                form.resetFields();
              }}
              footer={null}
              destroyOnClose
            >
              <Form layout="vertical" form={form} onFinish={handleSubmit} requiredMark="optional">
                <Form.Item
                  label="Provide the transaction reference"
                  name="transactionRef"
                  rules={[{ required: true, message: 'Transaction reference is required' }]}
                >
                  <Input placeholder="Enter mpesa transaction reference" />
                </Form.Item>

                <Form.Item
                  label="Order Reference"
                  name="orderRef"
                  rules={[{ required: true, message: 'Order reference is required' }]}
                  initialValue={selectedItem?.order_reference}
                >
                  <Input placeholder="Enter order reference" />
                </Form.Item>

                <Form.Item
                  label="Amount"
                  name="amount"
                  initialValue={selectedItem?.total_amount}
                  rules={[
                    { required: true, message: 'Amount is required' },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: 'Enter a valid amount' },
                  ]}
                >
                  <Input placeholder="Enter amount e.g. 2500" />
                </Form.Item>

                <Button type="primary" htmlType="submit" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  Submit
                </Button>
              </Form>
            </Modal>
          </Card>
        )}
      </Space>
    </div>
  );
}

export default AdditionalActions;
