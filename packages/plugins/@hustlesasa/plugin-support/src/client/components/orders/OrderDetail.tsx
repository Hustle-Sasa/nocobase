import React, { useState } from 'react';
import { QuestionCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Flex, Tabs, Button, Typography, Popconfirm, message, Skeleton, Divider, Modal, Input, Form } from 'antd';
import { useAPIClient, useRequest, useCurrentRoles } from '@nocobase/client';
import type { TabsProps } from 'antd';
import { format } from 'date-fns';

import AdditionalActions from './AdditionalActions';
import CustomerDetails from './CustomerDetails';
import PaymentDetails from './PaymentDetails';
import OrderPayments from './OrderPayments';
import type { DataItem } from './type';
import OrderItems from './OrderItems';
import RefundForm from './RefundForm';
import Receipts from './Receipts';

export type { DataItem, OrderItem, ProductCover, ProductBannerAsset, ExtraDetails, Buyer } from './type';

const { Text, Title } = Typography;

function OrderDetail({ selectedItem }: { selectedItem?: DataItem }) {
  /**
   * state
   */
  const [resend, setResend] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  /**
   * constants
   */
  const id = selectedItem?.id;
  const roles = useCurrentRoles();
  // console.log(roles);
  const isDeveloper =
    Array.isArray(roles) &&
    roles.some((role: any) => {
      const nameCheck = typeof role?.name === 'string' ? role.name : undefined;
      const titleCheck = typeof role?.title === 'string' ? role.title : undefined;
      const roleName = nameCheck || titleCheck;
      return roleName?.toLowerCase() === 'technical';
    });

  /**
   * api
   */
  const api = useAPIClient();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{ data: { data: DataItem } }>(
    {
      url: `orders:get/${id}`,
      params: { id },
    },
    {
      refreshDeps: [id],
    },
  );

  /**
   * variables
   */
  const data = (response?.data?.['data'] || {}) as DataItem;

  /**
   * constants
   */
  const completedStatus = ['PAYMENT_COMPLETED', 'DELIVERED'];
  const cancelledStatus = ['CANCELLED', 'REFUNDED'];

  const items: TabsProps['items'] = [
    {
      key: 'order-details',
      label: 'Order Details',
      children: <Detail selectedItem={data} />,
    },
    {
      key: 'payments',
      label: 'Payments',
      children: <OrderPayments order={data.order_reference} status={data?.status} mutate={refresh} />,
    },
    ...(completedStatus.includes(data?.status)
      ? [
          {
            key: 'order-receipt',
            label: 'Order Receipt',
            children: <Receipts selectedItem={data} />,
          },
        ]
      : []),
    ...(isDeveloper
      ? [
          {
            key: 'additional-actions',
            label: 'Additional actions',
            children: <AdditionalActions selectedItem={data} />,
          },
        ]
      : []),
  ];

  /**
   * methods
   */

  const cancelOrder = async (id: string) => {
    try {
      const response = await api.request({
        url: `orders:delete/${id}`,
        params: { id },
      });

      if (response?.data?.data?.['data']) {
        refresh();
        messageApi.success('Order cancelled!');
      }
    } catch (error) {
      messageApi.error('Failed to cancel order');
    }
  };

  const resendOrder = async () => {
    const ref = data?.order_reference;

    setResend(true);

    try {
      const response = await api.request({
        url: `orders:resend`,
        params: {
          order_reference: ref,
        },
      });

      if (response?.data?.data?.['data']) {
        refresh();
        setResend(false);
        messageApi.success('Order sent!');
      }
    } catch (error) {
      messageApi.error('Failed to send order');
    }
  };

  if (!response && loading) {
    return (
      <Flex vertical gap={24}>
        <Skeleton avatar active paragraph={{ rows: 4 }} />
        <Divider />
        <Skeleton active paragraph={{ rows: 6 }} />
        <Divider />
        <Skeleton active paragraph={{ rows: 4 }} />
      </Flex>
    );
  }

  return (
    <>
      {contextHolder}
      <Flex wrap="wrap" justify="space-between" gap={24} style={{ marginBottom: 24 }}>
        <div>
          <Title level={2}>Order #{data?.id}</Title>
          {data?.payment_completed_at && (
            <Text>
              <CalendarOutlined /> <span>{format(new Date(data?.payment_completed_at), 'dd MMM yyyy, HH:mm a')}</span>
            </Text>
          )}
        </div>

        <Flex align="center" gap={16}>
          {!cancelledStatus.includes(data?.status) && (
            <Popconfirm
              title="Cancel this order?"
              description="Are you sure you want to cancel this order?"
              onConfirm={() => cancelOrder(data?.id)}
              placement="left"
              okText="Yes, cancel"
              cancelText="No"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
              <Button danger>Cancel order</Button>
            </Popconfirm>
          )}

          {/* {completedStatus.includes(data?.status) && <Button onClick={() => setOpen(true)}>Refund</Button>} */}

          {completedStatus.includes(data?.status) && (
            <Button type="primary" loading={resend} onClick={resendOrder}>
              Resend tickets
            </Button>
          )}
        </Flex>
      </Flex>

      <Tabs defaultActiveKey="order-details" items={items} />

      {completedStatus.includes(data?.status) && open && (
        <Modal
          open={open}
          title="Refund item"
          okText="Refund"
          confirmLoading={confirmLoading}
          cancelText="Cancel"
          okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
          onCancel={() => {
            setOpen(false);
          }}
          modalRender={(dom) => <RefundForm {...{ selectedItem, dom, setOpen, message, setConfirmLoading }} />}
        >
          <div style={{ padding: '24px 0' }}>
            <Form.Item
              name="reason"
              label="What is the reason for this refund? Give details"
              rules={[{ required: true, message: 'Please enter the reason!' }]}
            >
              <Input.TextArea />
            </Form.Item>
          </div>
        </Modal>
      )}
    </>
  );
}

const Detail = ({ selectedItem }: { selectedItem: DataItem }) => {
  return (
    <Flex vertical gap={24}>
      <OrderItems selectedItem={selectedItem} />

      <CustomerDetails selectedItem={selectedItem} />

      <PaymentDetails selectedItem={selectedItem} />
    </Flex>
  );
};

export default OrderDetail;
