import React, { useState } from 'react';
import { Button, Flex, Form, Input, Modal, Space, Spin, Table, Tag, Popconfirm, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useAPIClient, useRequest, withDynamicSchemaProps } from '@nocobase/client';

import { BlockName } from './constant';
import AssignAgentForm from './AssignAgentForm';

export interface User {
  user_id: number;
  lname: string;
  fname: string;
  phone: string;
  email: string;
  account: number;
  role: number;
  verification_link: any;
}

export const TicketAgents = withDynamicSchemaProps(
  () => {
    /**
     * state
     */
    const [searchText, setSearchText] = useState('');
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<User | null>(null);

    // Add after existing state declarations
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 30,
      total: 0,
    });

    /**
     * api
     */

    const api = useAPIClient();
    const [messageApi, contextHolder] = message.useMessage();
    const {
      data: response,
      loading,
      refresh,
    } = useRequest<{ data: User[] }>(
      {
        url: 'operations:list',
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

    const data = response?.data?.['data'] || [];

    const columns = [
      {
        title: 'User ID',
        dataIndex: 'user_id',
        key: 'user_id',
        width: 80,
      },
      {
        title: 'Account ID',
        dataIndex: 'account',
        key: 'account',
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
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: User) => (
          <Space>
            <Popconfirm
              title="Delete this agent?"
              description="Are you sure you want to delete this agent?"
              onConfirm={() => deleteAgent(record.user_id)}
              placement="left"
              okText="Yes, delete"
              cancelText="No"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
              <Button danger>Delete</Button>
            </Popconfirm>

            <Button
              type="primary"
              onClick={() => {
                setOpen(true);
                setSelectedItem(record);
              }}
            >
              Assign
            </Button>
          </Space>
        ),
      },
    ];

    /**
     * methods
     */

    const deleteAgent = async (id: number) => {
      try {
        await api.request({
          url: `operations:delete/${id}`,
          params: { id },
        });

        refresh();
        messageApi.success('Agent deleted successfully!');
      } catch (error) {
        messageApi.error('Unable to delete agent');
      }
    };

    if (!data && loading) {
      <Spin />;
    }

    return (
      <Flex vertical gap={24}>
        {contextHolder}

        <Table
          columns={columns}
          dataSource={data}
          rowKey="user_id"
          loading={loading}
          size="large"
          scroll={{ x: 800 }}
        />

        {selectedItem && (
          <Modal
            open={open}
            title="Assign Agent"
            okText="Assign"
            confirmLoading={confirmLoading}
            cancelText="Cancel"
            okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
            onCancel={() => {
              setSelectedItem(null);
              setOpen(false);
            }}
            modalRender={(dom) => <AssignAgentForm {...{ selectedItem, dom, setOpen, setConfirmLoading }} />}
          >
            <div style={{ padding: '24px 0' }}>
              <Form.Item
                name="account"
                label="Hustle Account ID"
                rules={[{ required: true, message: 'Please input the account ID of the hustle!' }]}
              >
                <Input />
              </Form.Item>
            </div>
          </Modal>
        )}
      </Flex>
    );
  },
  { displayName: BlockName },
);

export default TicketAgents;
