import React, { useState } from 'react';
import { useRequest } from '@nocobase/client';
import { Button, DatePicker, Input, Select, Spin, Table, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { format } from 'date-fns';
import type { Dayjs } from 'dayjs';

import { type SupportEnvironment } from '../(shared)/use-environment-settings';
import { formatMoney, status, statusText } from '../../lib';
import { DataItem, Buyer } from '../orders/type';
import { Customer } from './type';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Props {
  customer: Customer;
  environment: SupportEnvironment;
}

const CustomerOrders: React.FC<Props> = ({ customer, environment }) => {
  const [searchText, setSearchText] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 40,
    total: 0,
  });

  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{ data: { data: DataItem[]; meta: any } }>(
    {
      url: 'customers:listOrders',
      params: {
        customer_id: customer.id,
        page: pagination.current,
        limit: pagination.pageSize,
        env: environment,
        // ...(searchText ? { search: searchText } : {}),
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(dateRange?.[0] && dateRange?.[1]
          ? { date_from: dateRange[0].format('YYYY-MM-DD'), date_to: dateRange[1].format('YYYY-MM-DD') }
          : {}),
      },
    },
    {
      debounceWait: 300,
      refreshDeps: [pagination.current, pagination.pageSize, filterStatus, dateRange, environment],
      onBefore: () => console.log('[customers:listOrders] env=%s customer_id=%s page=%d', environment, customer.id, pagination.current),
      onSuccess: (res) => {
        setPagination((prev) => ({
          ...prev,
          total: res?.data?.meta?.total || 0,
        }));
      },
    },
  );

  const data = response?.data?.['data'] || [];

  const columns: TableColumnsType<DataItem> = [
    {
      title: 'Buyer name',
      dataIndex: 'buyer',
      key: 'full_name',
      ellipsis: true,
      render: (buyer: Buyer) => (buyer?.full_name ? buyer.full_name.substring(0, 250) : '-'),
    },
    {
      title: 'Merchant',
      dataIndex: 'hustle_name',
      key: 'hustle_name',
      ellipsis: true,
      render: (text: string) => (text ? text.substring(0, 250) : '-'),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right' as const,
      render: (_, record: DataItem) => <>{formatMoney(record.total_amount, record.currency)}</>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      render: (_, record: DataItem) =>
        record.created_at ? format(new Date(record.created_at), 'dd MMM yyyy, HH:mm a') : '-',
    },
    {
      title: 'Transaction Ref',
      dataIndex: 'payment_transaction_reference',
      key: 'payment_transaction_reference',
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <Tag color={status(text).color} style={{ color: status(text).text }}>
          {statusText(text)}
        </Tag>
      ),
    },
  ];

  const handleTableChange = (p: number) => {
    setPagination((prev) => ({ ...prev, current: p }));
  };

  if (!data && loading) {
    return <Spin />;
  }

  return (
    <div style={{ paddingTop: 16 }}>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Select
          placeholder="Filter by Status"
          style={{ width: 180 }}
          allowClear
          value={filterStatus}
          onChange={(val) => {
            setFilterStatus(val);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
        >
          {[
            { value: 'DRAFT', label: 'DRAFT' },
            { value: 'DELIVERED', label: 'DELIVERED' },
            { value: 'REFUNDED', label: 'REFUNDED' },
            { label: 'AWAITING PAYMENT', value: 'PAYMENT_PROCESSING' },
            { value: 'PAYMENT_FAILED', label: 'PAYMENT FAILED' },
            { label: 'PAYMENT COMPLETED', value: 'PAYMENT_COMPLETED' },
            { label: 'CANCELLED', value: 'CANCELLED' },
          ].map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        <RangePicker
          onChange={(dates) => {
            setDateRange(dates);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
        />

        <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="middle"
        scroll={{ x: 700 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showPrevNextJumpers: true,
          showQuickJumper: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: handleTableChange,
        }}
      />
    </div>
  );
};

export default CustomerOrders;
