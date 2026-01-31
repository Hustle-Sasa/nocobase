import React, { useState } from 'react';
import { useAPIClient, useRequest } from '@nocobase/client';
import { Button, Flex, message, Popconfirm, Spin, Table, Tag } from 'antd';

export interface DataItem {
  user_id: number;
  lname: string;
  fname: string;
  phone: string;
  email: string;
  account: number;
  role: number;
  verification_link: any;
}

function Users({ account }: { account: string }) {
  /**
   * state
   */
  const [add, setAdd] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * api
   */
  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{ data: DataItem[] }>(
    {
      url: 'hustles:listUsers',
      params: {
        account: account,
      },
    },
    {
      debounceWait: 300,
    },
  );

  /**
   * variables
   */
  const api = useAPIClient();

  const data = response?.data?.['data'] || [];

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 80,
    },
    {
      title: 'Last Name',
      dataIndex: 'lname',
      key: 'lname',
      ellipsis: true,
    },
    {
      title: 'First Name',
      dataIndex: 'fname',
      key: 'fname',
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text: number) => (
        <Tag color={text === 1 ? 'yellow' : text === 2 ? 'blue' : 'green'}>
          {text === 1 ? 'Admin' : text === 2 ? 'Manager' : 'Ticket Agent'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DataItem) => {
        // Only allow suspend for non-admins (role !== 1)
        if (record.role !== 1) {
          return (
            <Popconfirm
              title="Suspend this user?"
              description="Are you sure you want to suspend this user?"
              onConfirm={() => suspendUser(record.user_id)}
              placement="left"
              okText="Yes, suspend"
              cancelText="No"
            >
              <Button>Suspend</Button>
            </Popconfirm>
          );
        }
        return null;
      },
    },
  ];

  // methods

  const suspendUser = async (id: number) => {
    setAdd(true);
    try {
      const response = await api.request({
        url: `hustles:suspendUser`,
        params: {
          account,
        },
      });

      if (response.data.data) {
        refresh();
        messageApi.success(response.data.data.message);
      }
    } catch (error) {
      return;
    } finally {
      setAdd(false);
    }
  };

  const addUser = async () => {
    setAdd(true);
    try {
      const response = await api.request({
        url: `hustles:addUser`,
        params: {
          account,
        },
      });

      if (response.data.data) {
        refresh();
        messageApi.success(response.data.data.message);
      }
    } catch (error) {
      return;
    } finally {
      setAdd(false);
    }
  };

  if (!data && loading) {
    <Spin />;
  }

  return (
    <Flex vertical gap={24}>
      {contextHolder}
      <Flex justify="flex-end">
        <Button color="primary" type="primary" onClick={addUser} loading={add}>
          Add me
        </Button>
      </Flex>
      <Table columns={columns} dataSource={data} rowKey="user_id" loading={loading} size="large" scroll={{ x: 800 }} />
    </Flex>
  );
}

export default Users;
