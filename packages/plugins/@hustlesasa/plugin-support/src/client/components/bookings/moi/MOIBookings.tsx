import React, { useState } from 'react';
import { useRequest } from '@nocobase/client';
import { Button, Input, Spin, Table, TableColumnsType, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

import { Buyer, Order } from './type';
import { formatMoney } from '../../../lib';
import { MOIBookingDetails } from './MOIBookingDetails';

export const MoiBookings = () => {
  /**
   * state
   */
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /**
   * api
   */

  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{ data: Order[] }>(
    {
      url: 'bookings:getMOIBookings',
      params: {
        account: 28934,
        search: searchText,
        page: pagination.current,
        limit: pagination.pageSize,
      },
    },
    {
      debounceWait: 300,
      refreshDeps: [pagination.current, pagination.pageSize, searchText],
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
  const users = response?.data?.['data'] || [];

  const columns: TableColumnsType<Order> = [
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
      // ellipsis: true,
      render: (buyer: Buyer) => (
        <>
          <p>{buyer?.['Name'] ? buyer?.['Name'] : '-'}</p>
          <p>{buyer?.['phone'] ? buyer?.['phone'] : '-'}</p>
          <p>{buyer?.['email'] ? buyer?.['email'] : '-'}</p>
        </>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
      render: (_, record: Order) => <p style={{ color: '#D34875' }}>{formatMoney(record.total, record.currency)}</p>,
    },
    {
      title: 'Merchant tax',
      dataIndex: 'merchant_tax',
      key: 'merchant_tax',
      width: 200,
      align: 'center' as const,
      render: (_, record: Order) => <>{formatMoney(record.merchant_tax, record.currency)}</>,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      width: 80,
      align: 'center' as const,
      responsive: ['lg'],
      render: (_, record: Order) => <>{formatMoney(record.discount, record.currency)}</>,
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      ellipsis: true,
      width: 80,
      responsive: ['lg'],
      render: (text: number) => text,
    },
    {
      title: 'Payment method',
      dataIndex: 'pay_method',
      key: 'pay_method',
      render: (_, record: Order) => (record?.pay_method?.title ? record?.pay_method?.title : '-'),
    },
    {
      title: 'Discount code',
      dataIndex: 'discount_code',
      key: 'discount_code',
      align: 'center' as const,
      responsive: ['lg'],
      render: (discount_code: string) => (discount_code ? discount_code : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record: Order) => (
        <Tag
          color={record?.status?.key === 3 ? 'green' : record?.status?.key === 2 ? 'yellow' : 'red'}
          style={{ textTransform: 'uppercase' }}
        >
          {record?.status?.status}
        </Tag>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'date',
      key: 'date',
      ellipsis: true,
      render: (_, record: Order) => <>{record.date ? format(new Date(record.date), 'dd MMM yyyy, HH:mm a') : '-'}</>,
    },
  ];

  /**
   *
   * @param p methods
   */
  const handleSearch = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    refresh();
  };

  // Update handleTableChange
  const handleTableChange = (p: number) => {
    setPagination((prev) => ({
      ...prev,
      current: p,
      pageSize: pagination.pageSize,
    }));
  };

  if (!users && loading) {
    <Spin />;
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          gap: '16px',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Input.Search
          allowClear
          placeholder="Search ..."
          value={searchText}
          enterButton={<SearchOutlined />}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          onPressEnter={handleSearch}
          style={{ width: '300px' }}
        />

        <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="order_id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => {
            setSelectedOrder(record);
            setDrawerOpen(true);
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showPrevNextJumpers: true,
          showQuickJumper: false,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: handleTableChange,
        }}
      />

      <MOIBookingDetails
        open={drawerOpen}
        order={selectedOrder}
        onClose={() => setDrawerOpen(false)}
        onRescheduleSuccess={refresh}
      />
    </div>
  );
};

export default MoiBookings;
