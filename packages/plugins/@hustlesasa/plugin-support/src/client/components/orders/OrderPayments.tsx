import React, { useState } from 'react';
import { Button, Flex, message, Spin, Table, TableColumnsType, Tag } from 'antd';
import { useAPIClient, useRequest } from '@nocobase/client';
import { CopyOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

import { getStatusColor, handleCopy } from '../../lib';

export interface DataItem {
  completed: boolean;
  entity: string;
  gsi2sk: string;
  gsi3sk: string;
  metadata: Metadata;
  orderReference: string;
  gsi1sk: string;
  status: string;
  createdAt: string;
  hustleId: number;
  providerReference: string;
  method: Method2;
  transactionReference: string;
  amount: string;
  provider: string;
  details: Details2;
  gsi3pk: string;
  gsi1pk: string;
  traceId: string;
  gsi2pk: string;
}

export interface Metadata {
  request: Request;
}

export interface Request {
  amount: string;
  method: Method;
  transactionReference: string;
  providerId: string;
  hustleId: number;
  orderReference: string;
  details: Details;
}

export interface Method {
  country: string;
  fees: Fees;
  provider: string;
  requiredFields: any[];
  displayName: string;
  vat: Vat;
  channel: string;
  currency: string;
  sort: number;
  type: string;
  key: string;
  status: string;
}

export interface Fees {
  percentage: number;
}

export interface Vat {
  percentage: number;
}

export interface Details {}

export interface Method2 {
  country: string;
  fees: Fees2;
  provider: string;
  requiredFields: any[];
  displayName: string;
  vat: Vat2;
  channel: string;
  currency: string;
  sort: number;
  type: string;
  key: string;
  status: string;
}

export interface Fees2 {
  percentage: number;
}

export interface Vat2 {
  percentage: number;
}

export interface Details2 {}

function OrderPayments({ order, status, mutate }) {
  /**
   * state
   */
  const [confirm, setConfirm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * api
   */
  const api = useAPIClient();
  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{ data: DataItem[] }>({
    url: 'orders:listPayments',
    params: {
      order_reference: order,
    },
  });

  /**
   * variables
   */
  const data = response?.data?.['data'] || [];

  /**
   * constants
   */
  const isNotCompleted = status === 'PAYMENT_PROCESSING';

  const columns: TableColumnsType<DataItem> = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, record: any) => (
        <span>
          {record.method.currency} {Number(record.amount)}
        </span>
      ),
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: 'Transaction Ref',
      dataIndex: 'transactionReference',
      key: 'transactionReference',
      responsive: ['md'],
      render: (text: string) => (
        <>
          <span style={{ cursor: 'pointer', textDecoration: 'underline dashed 1px', textUnderlineOffset: 2 }}>
            {text}
          </span>

          <Button type="link" onClick={() => handleCopy(text)} title="Click to copy" style={{ color: '#00cc99' }}>
            <CopyOutlined size={20} />
          </Button>
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => <Tag color={getStatusColor(text?.toLowerCase())}>{text}</Tag>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      render: (_: any, record: DataItem) => (
        <>{record.createdAt ? format(new Date(record.createdAt), 'dd MMM yyyy, HH:mm a') : '-'}</>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      responsive: ['lg'],
      render: (_: any, record: DataItem) => (
        <>
          {isNotCompleted && record.status === 'success' ? (
            <Button loading={confirm} type="primary" onClick={() => confirmPayment(record.orderReference)}>
              Confirm
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  /**
   * methods
   */

  const confirmPayment = async (ref: string) => {
    setConfirm(true);
    try {
      const response = await api.request({
        url: `orders:confirm`,
        params: {
          order_reference: ref,
        },
      });

      if (response.data.data) {
        setConfirm(false);
        refresh();
        mutate();
        messageApi.success(response.data.data.message);
      }
    } catch (error) {
      messageApi.error('Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <Flex gap="middle" vertical style={{ paddingTop: 24 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <div style={{ paddingTop: 16 }}>
      {contextHolder}
      <Table scroll={{ x: 800 }} columns={columns} dataSource={data} rowKey="transactionReference" loading={loading} />
    </div>
  );
}

export default OrderPayments;
