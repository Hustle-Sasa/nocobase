import React from 'react';
import { Button, Flex, Image, Input, message, Select, Table, TableColumnsType, Tag } from 'antd';
import { useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

import { handleFormatDateTime } from '../../../utls/helper';
import { BlockName } from './constant';
import { DataItem } from './type';

const Details = React.lazy(() => import('./Details'));

export const Requests = withDynamicSchemaProps(
  () => {
    const [messageApi, contextHolder] = message.useMessage();

    // states
    const [search, setSearch] = React.useState('');
    const [filters, setFilters] = React.useState<{ status?: string; country?: string }>({});
    const [pagination, setPagination] = React.useState({
      current: 1,
      pageSize: 15,
      total: 0,
    });

    // api
    const {
      data: response,
      loading,
      refresh,
    } = useRequest<{ data: { data: DataItem[]; meta: any } }>(
      {
        url: 'operations:emRequestList',
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          ...filters,
        },
      },
      {
        debounceWait: 300,
        refreshDeps: [search, pagination.current, pagination.pageSize, filters],
        onSuccess({ data: { meta } }) {
          setPagination((prev) => ({
            ...prev,
            total: meta?.total || 0,
          }));
        },
        onError() {
          messageApi.error('Failed to fetch requests');
        },
      },
    );

    // handlers
    const handleStatus = (approvedToMarketplace: boolean | null): { text: string; color: string } => {
      if (approvedToMarketplace === null) {
        return { text: 'Pending', color: 'orange' };
      }
      return approvedToMarketplace ? { text: 'Approved', color: 'green' } : { text: 'Rejected', color: 'red' };
    };

    const handleSearch = () => {
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
      refresh();
    };

    // variables
    const data = response?.data?.data || [];
    console.log('Data:', data);
    const colums: TableColumnsType<DataItem> = [
      {
        title: 'Shop Name',
        dataIndex: ['product', 'hustle', 'name'],
        key: 'name',
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      },
      {
        title: 'Event',
        dataIndex: ['product', 'title'],
        key: 'title',
        onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        render: (_, { product: { title, cover } }) => {
          return (
            <>
              <Image
                src={cover.url}
                alt={title}
                width={32}
                height={32}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: 100,
                }}
              />
              <span style={{ marginLeft: 8 }}>{title}</span>
            </>
          );
        },
      },
      {
        title: 'Category',
        dataIndex: ['product', 'category', 'name'],
        key: 'category.name',
        render: (category) => category || '-',
      },
      {
        title: 'Country',
        dataIndex: ['product', 'country'],
        key: 'country',
      },
      {
        title: 'Start Date / Time',
        dataIndex: ['product', 'default_extra_details', 'start_date'],
        key: 'start_date',
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        render: (
          _,
          {
            product: {
              default_extra_details: { start_date, start_time },
            },
          },
        ) => handleFormatDateTime(start_date, start_time),
      },
      {
        title: 'End Date / Time',
        dataIndex: ['product', 'default_extra_details', 'end_date'],
        key: 'end_date',
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        render: (
          _,
          {
            product: {
              default_extra_details: { end_date, end_time },
            },
          },
        ) => handleFormatDateTime(end_date, end_time),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (_, { approved_to_marketplace }) => {
          const status = handleStatus(approved_to_marketplace);
          return <Tag color={status.color}>{status.text}</Tag>;
        },
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Details request={record} refresh={refresh}>
            {({ proceed }) => (
              <Button color="primary" type="link" style={{ color: '#00cc99' }} onClick={proceed}>
                View Event
              </Button>
            )}
          </Details>
        ),
      },
    ];

    return (
      <div style={{ padding: 24 }}>
        {contextHolder}

        <Flex style={{ marginBottom: 16 }} gap={6} justify="space-between" align="center">
          <Flex align="center" gap={6}>
            <Select
              allowClear
              style={{ width: 300 }}
              placeholder="Filter by status"
              value={filters?.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              {[
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'requested', label: 'Pending' },
              ].map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            <Select
              allowClear
              style={{ width: 300 }}
              value={filters?.country}
              placeholder="Filter by country"
              onChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
            >
              {[
                { value: 'GH', label: 'Ghana' },
                { value: 'NG', label: 'Nigeria' },
                { value: 'KE', label: 'Kenya' },
              ].map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Flex>

          <Flex align="center" justify="flex" gap={8}>
            <Input.Search
              allowClear
              value={search}
              onSearch={handleSearch}
              style={{ width: '300px' }}
              enterButton={<SearchOutlined />}
              placeholder="Search by product title"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
              Refresh
            </Button>
          </Flex>
        </Flex>

        <Table
          columns={colums}
          dataSource={data}
          loading={loading}
          scroll={{ x: true }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showPrevNextJumpers: true,
            showQuickJumper: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '30', '50', '100'],
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
              }));
            },
          }}
        />
      </div>
    );
  },
  { displayName: BlockName },
);
