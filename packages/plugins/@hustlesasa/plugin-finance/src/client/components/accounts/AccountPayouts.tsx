import React, { useState } from 'react';
import { Card, Skeleton, Table, TableColumnsType, Tag } from 'antd';
import { useRequest } from '@nocobase/client';

import { formatMoney } from '../../lib';

export interface Transaction {
  trans_ref: string;
  amount: number;
  status: Status;
  merchant_tax: number;
  type: string;
  date: string;
  order: any;
  pay_ref: string;
  verified: number;
  pay_method: PayMethod;
  payed_by: any;
}

export interface Status {
  key: number;
  status: string;
}

export interface PayMethod {}

function AccountPayouts({ hustle }: { hustle: any }) {
  /**
   * state
   */
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });

  /**
   * api
   */

  const { data: response, loading } = useRequest<{ data: Transaction[] }>(
    hustle &&
      hustle?.account && {
        url: 'finance:listPayouts',
        params: { account: hustle?.account, page: pagination.current, pageSize: pagination.pageSize },
      },
    {
      debounceWait: 300,
      refreshDeps: [hustle?.account, pagination.current, pagination.pageSize],
      onSuccess: (res) => {
        setPagination((prev) => ({
          ...prev,
          total: res?.data?.meta?.total || 0,
        }));
      },
    },
  );

  /**
   * variables
   */
  const payouts = response?.data?.['data'] || [];

  const columns: TableColumnsType<any> = [
    {
      title: 'Transaction Reference',
      dataIndex: 'trans_ref',
      key: 'trans_ref',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (_, record: Transaction) => <>{formatMoney(record.amount, hustle?.country?.currencyCode)}</>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record: Transaction) => (
        <Tag
          color={record?.status?.key === 3 ? 'green' : record?.status?.key === 2 ? 'yellow' : 'red'}
          style={{ textTransform: 'uppercase' }}
        >
          {record?.status?.status}
        </Tag>
      ),
    },
    {
      title: 'Payment Reference',
      dataIndex: 'pay_ref',
      key: 'pay_ref',
      render: (pay_ref) => <>{pay_ref}</>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      ellipsis: true,
    },
  ];

  if (!payouts && loading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <Card title="Payouts">
      <Table
        size="large"
        scroll={{ x: 800 }}
        columns={columns}
        dataSource={payouts}
        rowKey="trans_ref"
        loading={loading}
      />
    </Card>
  );
}

export default AccountPayouts;
