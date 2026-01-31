import React, { useState } from 'react';
import { useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { Button, Drawer, Flex, Input, Select, Spin, Table, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { format } from 'date-fns';

import { formatMoney, status, statusText } from '../../lib';
import { DataItem, Buyer } from './type';
import OrderDetail from './OrderDetail';
import { BlockName } from './constant';

const { Option } = Select;

export const Orders = withDynamicSchemaProps(
  () => {
    /**
     * state
     */
    const [searchText, setSearchText] = useState<string | undefined>();
    const [searchOrderId, setSearchOrderId] = useState<string | undefined>();
    const [searchType, setSearchType] = useState<'general' | 'orderId' | undefined>(undefined);
    const [filterStatus, setFilterStatus] = React.useState<string | undefined>();
    const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    // Add after existing state declarations
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 40,
      total: 0,
    });

    /**
     * api
     */

    const {
      data: response,
      loading,
      refresh,
    } = useRequest<{ data: DataItem[]; meta: any }>(
      {
        url: 'orders:list',
        params: {
          search: searchText,
          status: filterStatus,
          page: pagination.current,
          limit: pagination.pageSize,
          id: searchOrderId,
        },
      },
      {
        debounceWait: 300,
        refreshDeps: [searchText, pagination.current, pagination.pageSize, filterStatus, searchOrderId],
        onSuccess: (res) => {
          setPagination((prev) => ({
            ...prev,
            total: res?.data?.meta?.total || 0,
          }));
        },
        onError: (error) => {
          console.error('Failed to fetch orders:', error);
        },
      },
    );

    /**
     * variables
     */
    const data = response?.data?.['data'] || [];

    const columns: TableColumnsType<DataItem> = [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: 'Buyer name',
        dataIndex: 'buyer',
        key: 'full_name',
        ellipsis: true,
        render: (buyer: Buyer) => (buyer?.full_name ? buyer?.full_name.substring(0, 250) : '-'),
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
        render: (_, record: DataItem) => (
          <>{record.created_at ? format(new Date(record.created_at), 'dd MMM yyyy, HH:mm a') : '-'}</>
        ),
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
          <Tag
            color={status(text).color}
            style={{
              color: status(text).text,
            }}
          >
            {statusText(text)}
          </Tag>
        ),
      },
      {
        title: 'Reason',
        dataIndex: 'payment_failed_reason',
        key: 'payment_failed_reason',
        ellipsis: true,
        responsive: ['lg'],
        render: (text: string) => (text ? text.substring(0, 50) : '-'),
      },
      {
        title: 'Trace ID',
        dataIndex: 'trace_id',
        key: 'trace_id',
        responsive: ['lg'],
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: DataItem) => (
          <Button
            color="primary"
            type="link"
            style={{ color: '#00cc99' }}
            onClick={() => {
              setSelectedItem(record);
              setModalVisible(true);
            }}
          >
            View Order
          </Button>
        ),
      },
    ];

    /**
     * methods
     */

    // Handle search
    const handleSearch = () => {
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
      refresh();
    };

    const handleSearchTypeChange = (value: 'general' | 'orderId') => {
      setSearchType(value);
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));

      if (value === 'orderId') {
        setSearchText(undefined);
      } else {
        setSearchOrderId(undefined);
      }
    };

    // Update handleTableChange
    const handleTableChange = (p: number) => {
      setPagination((prev) => ({
        ...prev,
        current: p,
        pageSize: pagination.pageSize,
      }));
    };

    if (!data && loading) {
      return <Spin />;
    }

    return (
      <div style={{ padding: 24 }}>
        <Flex wrap="wrap" gap={16} align="center" justify="space-between" style={{ marginBottom: 24 }}>
          <Select
            placeholder="Filter by Status"
            style={{ width: 300 }}
            allowClear
            value={filterStatus}
            onChange={setFilterStatus}
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
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: status(option.value).text,
                    }}
                  />
                  {option.label}
                </span>
              </Option>
            ))}
          </Select>

          <Flex align="center" justify="flex-end" gap={8}>
            <Select<'general' | 'orderId'>
              value={searchType}
              style={{ width: 300 }}
              placeholder="Choose what you want to search"
              onChange={handleSearchTypeChange}
            >
              <Option value="general">Search by order, phone or hustle</Option>
              <Option value="orderId">Search by order ID</Option>
            </Select>

            {searchType && (
              <>
                {searchType === 'orderId' ? (
                  <Input.Search
                    allowClear
                    placeholder="Search by order number"
                    value={searchOrderId}
                    enterButton={<SearchOutlined />}
                    onChange={(e) => {
                      setSearchOrderId(e.target.value);
                    }}
                    onPressEnter={handleSearch}
                    style={{ width: '300px' }}
                  />
                ) : (
                  <Input.Search
                    allowClear
                    placeholder="Search by reference, phone or hustle.."
                    value={searchText}
                    enterButton={<SearchOutlined />}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                    }}
                    onPressEnter={handleSearch}
                    style={{ width: '300px' }}
                  />
                )}
              </>
            )}

            <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
              Refresh
            </Button>
          </Flex>
        </Flex>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showPrevNextJumpers: true,
            showQuickJumper: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            onChange: handleTableChange,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />

        <Drawer
          width={typeof window !== 'undefined' && window.innerWidth >= 992 ? '50%' : '100%'}
          placement="right"
          closable={false}
          open={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedItem(null);
          }}
          // Responsive style to help with edge cases
          style={{
            maxWidth: '100vw',
          }}
        >
          {selectedItem && <OrderDetail selectedItem={selectedItem} />}
        </Drawer>
      </div>
    );
  },
  { displayName: BlockName },
);

export default Orders;
