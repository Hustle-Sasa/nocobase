import React from 'react';
import { Button, Flex, Image, Input, message, Select, Table, TableColumnsType } from 'antd';
import { useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { DeleteFilled, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

import { DataItem, dummyDataItems } from './type';
import { handleFormatDateTime } from '../../../utls/helper';
import { BlockName } from './constant';

export const Featured = withDynamicSchemaProps(
  () => {
    const [messageApi, contextHolder] = message.useMessage();

    // states
    const [search, setSearch] = React.useState('');
    const [filters, setFilters] = React.useState<{ status?: string; country?: string }>({});
    const [pagination, setPagination] = React.useState({
      current: 1,
      pageSize: 30,
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
        onSuccess(res) {
          setPagination((prev) => ({
            ...prev,
            total: res?.meta?.total || 0,
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
    const meta = response?.data?.meta || {};

    const colums: TableColumnsType<DataItem> = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Shop Name',
        dataIndex: ['hustle', 'name'],
        key: 'hustle.name',
      },
      {
        title: 'Event',
        dataIndex: 'title',
        key: 'title',
        render: (_, { title, cover }) => {
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
        dataIndex: ['category', 'name'],
        key: 'category.name',
      },
      {
        title: 'Country',
        dataIndex: 'country',
        key: 'country',
      },
      {
        title: 'Start Date / Time',
        dataIndex: ['default_extra_details', 'start_date'],
        key: 'start_date',
        render: (_, { default_extra_details: { start_date, start_time } }) =>
          handleFormatDateTime(start_date, start_time),
      },
      {
        title: 'End Date / Time',
        dataIndex: ['default_extra_details', 'end_date'],
        key: 'end_date',
        render: (_, { default_extra_details: { end_date, end_time } }) => handleFormatDateTime(end_date, end_time),
      },
      {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => {
          return (
            <Button
              type="link"
              color="danger"
              icon={<DeleteFilled />}
              onClick={() => messageApi.info(`Delete request ${record.id}`)}
            />
          );
        },
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
            <Button color="primary">Add Events</Button>
          </Flex>
        </Flex>

        <Table
          dataSource={dummyDataItems}
          columns={colums}
          loading={loading}
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
