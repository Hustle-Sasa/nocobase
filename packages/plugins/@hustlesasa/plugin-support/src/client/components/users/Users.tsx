import React, { useState } from 'react';
import { useRequest } from '@nocobase/client';
import { Button, Input, Spin, Table, TableColumnsType } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

interface User {
  user_id: number;
  lname: string;
  fname: string;
  phone: string;
  email: string;
  account: number;
  role: number;
  verification_link: string;
}

export const Users = () => {
  /**
   * state
   */
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
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
  } = useRequest<{ data: User[] }>(
    {
      url: 'user:list',
      params: {
        user_id: user,
        user_phone_number: phoneNumber,
        user_email: email,
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    },
    {
      debounceWait: 300,
      refreshDeps: [pagination.current, pagination.pageSize, user, phoneNumber, email],
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

  const columns: TableColumnsType<User> = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 80,
      responsive: ['md'],
    },
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
      width: 80,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 200,
      align: 'center' as const,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: 'Last Name',
      dataIndex: 'lname',
      key: 'lname',
      ellipsis: true,
      responsive: ['lg'],
      render: (text: string) => (text ? text.substring(0, 50) + '...' : '-'),
    },
    {
      title: 'First Name',
      dataIndex: 'fname',
      key: 'fname',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
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
          placeholder="Search user ID"
          value={user}
          enterButton={<SearchOutlined />}
          onChange={(e) => {
            setUser(e.target.value);
          }}
          onPressEnter={handleSearch}
          style={{ width: '300px' }}
        />

        <Input.Search
          allowClear
          placeholder="Search by phone number"
          value={phoneNumber}
          enterButton={<SearchOutlined />}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
          onPressEnter={handleSearch}
          style={{ width: '300px' }}
        />

        <Input.Search
          allowClear
          placeholder="Search by email"
          value={email}
          enterButton={<SearchOutlined />}
          onChange={(e) => {
            setEmail(e.target.value);
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
        rowKey="user_id"
        loading={loading}
        size="large"
        scroll={{ x: 800 }}
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
    </div>
  );
};

export default Users;
