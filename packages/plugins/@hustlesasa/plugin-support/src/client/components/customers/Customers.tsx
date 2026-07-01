import React, { useState } from 'react';
import { useRequest } from '@nocobase/client';
import { Button, Drawer, Input, Space, Spin, Switch, Table, TableColumnsType, Tag, Tabs } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

import { Customer } from './type';
import CustomerDetail from './CustomerDetail';
import CustomerOrders from './CustomerOrders';
import EnvironmentSelector from '../(shared)/EnvironmentSelector';
import { useEnvironmentSettings } from '../(shared)/use-environment-settings';

export const Customers = () => {
  /**
   * state
   */
  const { environment, setEnvironment } = useEnvironmentSettings();
  const [search, setSearch] = useState('');
  const [hasDownloadedApp, setHasDownloadedApp] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add after existing state declarations
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });

  /**
   * api
   */

  const { data: configData } = useRequest<{ data: Record<string, string> }>({ url: 'client-config:get' });

  const resolvedServicesUrl = React.useMemo(() => {
    const cfg = configData?.data;
    if (!cfg) return null;
    return environment === 'staging' ? cfg.servicesApiUrl : cfg.productionServicesApiUrl;
  }, [configData, environment]);

  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{
    data: {
      data: Customer[];
      meta: {
        total: number;
      };
    };
  }>(
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
      onBefore: () => console.log('[customers:list] env=%s url=%s page=%d', environment, resolvedServicesUrl, pagination.current),
      onSuccess: (res) => {
        console.log('[customers:list] result', res);
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

  const customers = response?.data?.data || [];

  const columns: TableColumnsType<Customer> = [
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      width: 180,
      align: 'center' as const,
      render: (text: string) => text || '-',
    },
    {
      title: 'App Downloaded',
      dataIndex: 'app_downloaded',
      key: 'app_downloaded',
      width: 120,
      align: 'center' as const,
      render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Yes' : 'No'}</Tag>,
    },
    {
      title: 'Buyer App Activated',
      dataIndex: 'buyer_app_activated',
      key: 'buyer_app_activated',
      width: 180,
      align: 'center' as const,
      render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Yes' : 'No'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
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

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    refresh();
  };

  const handleSwitchChange = (checked: boolean) => {
    setHasDownloadedApp(checked);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (p: number) => {
    setPagination((prev) => ({ ...prev, current: p, pageSize: pagination.pageSize }));
  };

  if (!customers && loading) {
    return <Spin />;
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
          justifyContent: 'space-between',
        }}
      >
        <Space align="center">
          <span>Has downloaded app</span>
          <Switch size="small" checked={hasDownloadedApp} onChange={handleSwitchChange} />
        </Space>

        <Space>
          <EnvironmentSelector value={environment} onChange={setEnvironment} />

          <Input.Search
            allowClear
            placeholder="Search by name, email or phone"
            value={search}
            enterButton={<SearchOutlined />}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: '320px' }}
          />

          <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        size="large"
        scroll={{ x: 600 }}
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
};

export default Customers;
