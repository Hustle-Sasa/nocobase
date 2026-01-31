import React, { useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Flex, Tabs, Button, Typography, Popconfirm, message, Skeleton, Divider, Modal, Input, Form } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useAPIClient, useRequest, useCurrentRoles } from '@nocobase/client';
import type { TabsProps } from 'antd';
import { format } from 'date-fns';

import AdditionalActions from './AdditionalActions';
import CustomerDetails from './CustomerDetails';
import PaymentDetails from './PaymentDetails';
import OrderPayments from './OrderPayments';
import OrderItems from './OrderItems';
import RefundForm from './RefundForm';

const { Text, Title } = Typography;

export interface DataItem {
  id: number;
  order_reference: string;
  coupon_code: any;
  coupon_code_id: any;
  affiliate_id: any;
  affiliate_commission: any;
  currency: string;
  sub_total: string;
  service_fee: string;
  address_label: any;
  vat_amount: any;
  vat_percentage: any;
  commission_amount: any;
  commission_percentage: any;
  discount_amount: string;
  delivery_amount: string;
  total_amount: string;
  delivery_address: string;
  delivery_address_apartment_number: any;
  delivery_notes: string;
  status: string;
  hustle_ids: number[];
  hustle_fcm_token: any;
  payment_method_id: string;
  payment_method_name: string;
  payer_phone: string;
  payer_email: string;
  buyer_id: number;
  inventory_reservation_id: string;
  inventory_claimed_at: string;
  customer_id: any;
  created_at: string;
  updated_at: string;
  payment_completed_at: string;
  payment_failed_at: any;
  payment_failed_reason: any;
  payment_transaction_reference: string;
  trace_id: string;
  shipped_at: any;
  delivered_at: string;
  cancelled_at: any;
  order_type: string;
  order_items: OrderItem[];
  buyer: Buyer;
}

export interface OrderItem {
  id: number;
  product_id: string;
  product_name: string;
  product_variant_id: string;
  product_variant_name: string;
  product_type: string;
  product_cover: ProductCover;
  product_banner_assets: ProductBannerAsset[];
  product_variant_banner_assets: any[];
  product_store_id: string;
  product_store_name: string;
  product_account_id: string;
  extra_details: ExtraDetails;
  quantity: number;
  unit_price: string;
  line_total: string;
  order_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCover {
  url: string;
  file: string;
  type: string;
}

export interface ProductBannerAsset {
  url: string;
  file: string;
  type: string;
}

export interface ExtraDetails {
  type: string;
  venue: string;
  end_date: string;
  end_time: string;
  start_date: string;
  start_time: string;
  coordinates: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface Buyer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: any;
  hustle_ids: number[];
  created_at: string;
  updated_at: string;
}

function OrderDetail({ selectedItem }) {
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
      const roleName =
        typeof role?.name === 'string' ? role.name : typeof role?.title === 'string' ? role.title : undefined;
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
  } = useRequest<{ data: DataItem }>(
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
  const data = response?.data?.['data'] || {};

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

  const cancelOrder = async (id: number) => {
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

const Detail = ({ selectedItem }) => {
  return (
    <Flex vertical gap={24}>
      <OrderItems selectedItem={selectedItem} />

      <CustomerDetails selectedItem={selectedItem} />

      <PaymentDetails selectedItem={selectedItem} />
    </Flex>
  );
};

export default OrderDetail;
