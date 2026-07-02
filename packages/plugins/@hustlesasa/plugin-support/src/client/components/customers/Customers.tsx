import React, { useState } from 'react';
import { useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { Button, Drawer, Flex, Input, Switch, Table, TableColumnsType, Tag, Tabs } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

import { Customer } from './type';
import { BlockName } from './constant';
import CustomerDetail from './CustomerDetail';
import CustomerOrders from './CustomerOrders';
import EnvironmentSelector from '../(shared)/EnvironmentSelector';
import { useEnvironmentSettings } from '../(shared)/use-environment-settings';

export const Customers = withDynamicSchemaProps(
  () => {
    // persistent settings
    const { environment, setEnvironment } = useEnvironmentSettings();

    // state
    const [search, setSearch] = useState('');
    const [hasDownloadedApp, setHasDownloadedApp] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 30,
      total: 0,
    });

    // api
    const {
      data: response,
      loading,
      refresh,
    } = useRequest<{ data: { data: Customer[]; meta: { total: number } } }>(
      {
        url: 'customers:list',
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          env: environment,
          ...(search ? { search } : {}),
          ...(hasDownloadedApp ? { has_downloaded_app: hasDownloadedApp } : {}),
        },
      },
      {
        debounceWait: 300,
        refreshDeps: [pagination.current, pagination.pageSize, search, hasDownloadedApp, environment],
        onSuccess(res) {
          setPagination((prev) => ({ ...prev, total: res?.data?.meta?.total || 0 }));
        },
      },
    );

    // variables
    const customers = response?.data?.data || [];

    const columns: TableColumnsType<Customer> = [
      {
        title: 'Full Name',
        dataIndex: 'fullname',
        key: 'fullname',
        render: (text: string) => text || '-',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        render: (text: string) => text || '-',
      },
      {
        title: 'Phone Number',
        dataIndex: 'phone',
        key: 'phone',
        align: 'center',
        render: (text: string) => text || '-',
      },
      {
        title: 'App Downloaded',
        dataIndex: 'app_downloaded',
        key: 'app_downloaded',
        align: 'center',
        render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Yes' : 'No'}</Tag>,
      },
      {
        title: 'Buyer App Activated',
        dataIndex: 'buyer_app_activated',
        key: 'buyer_app_activated',
        align: 'center',
        render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Yes' : 'No'}</Tag>,
      },
      {
        title: 'Actions',
        key: 'actions',
        align: 'center',
        render: (_: any, record: Customer) => (
          <Button
            type="link"
            style={{ color: '#00cc99' }}
            onClick={() => {
              setSelectedCustomer(record);
              setDrawerOpen(true);
            }}
          >
            View Customer
          </Button>
        ),
      },
    ];

    // handlers
    const handleSearch = () => {
      setPagination((prev) => ({ ...prev, current: 1 }));
      refresh();
    };

    return (
      <div style={{ padding: 24 }}>

        <Flex style={{ marginBottom: 16 }} gap={8} justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <EnvironmentSelector value={environment} onChange={setEnvironment} />
            <span>Has downloaded app</span>
            <Switch size="small" checked={hasDownloadedApp} onChange={(checked) => {
              setHasDownloadedApp(checked);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }} />
          </Flex>

          <Flex align="center" gap={8}>
            <Input.Search
              allowClear
              placeholder="Search by name, email or phone"
              value={search}
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '320px' }}
            />
            <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
              Refresh
            </Button>
          </Flex>
        </Flex>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          size="large"
          scroll={{ x: 'max-content' }}
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
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
        />

        <Drawer
          title={selectedCustomer?.fullname || 'Customer Details'}
          width={globalThis.window !== undefined && globalThis.window.innerWidth >= 992 ? '60%' : '100%'}
          placement="right"
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedCustomer(null);
          }}
        >
          {selectedCustomer && (
            <Tabs
              defaultActiveKey="details"
              items={[
                {
                  key: 'details',
                  label: 'Details',
                  children: <CustomerDetail customer={selectedCustomer} />,
                },
                {
                  key: 'orders',
                  label: 'Orders',
                  children: <CustomerOrders customer={selectedCustomer} environment={environment} />,
                },
              ]}
            />
          )}
        </Drawer>
      </div>
    );
  },
  { displayName: BlockName },
);

export default Customers;
