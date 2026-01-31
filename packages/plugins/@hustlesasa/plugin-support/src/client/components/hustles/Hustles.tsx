import React, { useState } from 'react';
import { Table, Button, Spin, Input, Drawer } from 'antd';
import type { TableColumnsType } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest, withDynamicSchemaProps } from '@nocobase/client';

import HustleDetailTabs from './HustleDetailTabs';
import { DataItem, ThemeObj } from './type';
import { BlockName } from './constant';

export const Hustles = withDynamicSchemaProps(
  () => {
    /**
     * state
     */
    const [searchText, setSearchText] = useState('');
    const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    // Add after existing state declarations
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 30,
      total: 0,
    });

    /**
     * api
     */

    const {
      data: response,
      loading,
      refresh,
    } = useRequest<{ data: DataItem[] }>(
      {
        url: 'hustles:list',
        params: {
          search: searchText,
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      },
      {
        debounceWait: 300,
        refreshDeps: [searchText, pagination.current, pagination.pageSize],
        onSuccess: (res) => {
          setPagination((prev) => ({
            ...prev,
            total: res?.data?.meta?.total || 0,
          }));
        },
      },
    );

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

    // Update handleTableChange
    const handleTableChange = (p: number) => {
      setPagination((prev) => ({
        ...prev,
        current: p,
        pageSize: pagination.pageSize,
      }));
    };

    /**
     * variables
     */
    const data = response?.data?.['data'] || [];

    const columns: TableColumnsType<DataItem> = [
      {
        title: 'ID',
        dataIndex: 'shop_id',
        key: 'shop_id',
        width: 80,
        responsive: ['md'],
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        responsive: ['md'],
        render: (text: string) => (text ? text.substring(0, 50) + '...' : '-'),
      },
      {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
        ellipsis: true,
        responsive: ['lg'],
        render: (text: string) => (text ? text.substring(0, 50) + '...' : '-'),
      },
      {
        title: 'Verified',
        dataIndex: 'verified',
        key: 'verified',
        render: (text: string) => (text ? text : '-'),
      },
      {
        title: 'Online',
        dataIndex: 'online',
        key: 'online',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: 'Theme',
        dataIndex: 'theme_obj',
        key: 'theme_obj',
        responsive: ['lg'],
        render: (theme_obj: ThemeObj) => theme_obj?.title,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: DataItem) => (
          <Button
            type="link"
            style={{ color: '#00cc99' }}
            onClick={() => {
              setModalVisible(true);
              setSelectedItem(record);
            }}
          >
            View
          </Button>
        ),
      },
    ];

    if (!data && loading) {
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
            justifyContent: 'flex-end',
          }}
        >
          <Input.Search
            allowClear
            placeholder="Search hustles..."
            value={searchText}
            enterButton={<SearchOutlined />}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination((prev) => ({
                ...prev,
                current: 1,
              }));
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
          dataSource={data}
          rowKey="shop_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showPrevNextJumpers: true,
            showQuickJumper: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
        />

        <Drawer
          size="large"
          width="60%"
          placement="right"
          closable={false}
          open={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedItem(null);
          }}
        >
          {selectedItem && <HustleDetailTabs selectedItem={selectedItem} />}
        </Drawer>
      </div>
    );
  },
  { displayName: BlockName },
);

export default Hustles;
