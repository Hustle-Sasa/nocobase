import React, { useState } from 'react';
import { useAPIClient, useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { Button, Form, Input, message, Modal, Spin, Table, TableColumnsType } from 'antd';
import { format } from 'date-fns';

import { BlockName } from './constant';

interface Values {
  reason: string;
}

export interface DataItem {
  trans_ref: string;
  amount: number;
  payee_account: string;
  date: string;
  merchant_tax: number;
  details: string;
  debited: number;
}

export const WithdrawalList = withDynamicSchemaProps(
  () => {
    /***
     * state
     */
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

    // Add after existing state declarations
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 20,
      total: 0,
    });

    /**
     *
     */

    const { data: response, loading } = useRequest<{ data: DataItem[] }>(
      {
        url: 'finance:list',
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      },
      {
        refreshDeps: [pagination.current, pagination.pageSize],
        onSuccess: (res) => {
          setPagination((prev) => ({
            ...prev,
            total: res?.data?.meta?.total || 0,
          }));
        },
      },
    );

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
    const withdrawals = response?.data?.['data'] || [];

    const columns: TableColumnsType<any> = [
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 100,
        responsive: ['md'],
        render: (amount: number) => amount.toFixed(2),
      },
      {
        title: 'Reference',
        dataIndex: 'trans_ref',
        key: 'trans_ref',
        responsive: ['lg'],
      },
      {
        title: 'Payee Account',
        dataIndex: 'payee_account',
        key: 'payee_account',
        render: (text: string) => text,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        ellipsis: true,
        responsive: ['lg'],
        render: (_, record: DataItem) => (
          <>{record.date ? format(new Date(record.date), 'dd MMM yyyy, HH:mm a') : '-'}</>
        ),
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
        render: (details) => <>{details}</>,
      },
      {
        title: 'Debited',
        dataIndex: 'debited',
        key: 'debited',
        width: 80,
        align: 'end' as const,
        responsive: ['md'],
      },
      {
        title: 'Merchant tax',
        dataIndex: 'merchant_tax',
        key: 'merchant_tax',
        align: 'end' as const,
        responsive: ['md'],
        width: 120,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        responsive: ['md'],
        align: 'end' as const,
        render: (_, record: DataItem) => (
          <Button
            style={{ color: '#00cc99' }}
            color="primary"
            onClick={() => {
              setSelectedItem(record);
              setOpen(true);
            }}
          >
            Approve
          </Button>
        ),
      },
    ];

    if (!withdrawals && loading) {
      return <Spin />;
    }

    return (
      <div style={{ padding: 24 }}>
        <Table
          columns={columns}
          dataSource={withdrawals}
          rowKey="trans_ref"
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

        {selectedItem && (
          <Modal
            open={open}
            title="Approve Withdrawals"
            okText="Approve"
            confirmLoading={confirmLoading}
            cancelText="Cancel"
            okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
            onCancel={() => {
              setSelectedItem(null);
              setOpen(false);
            }}
            modalRender={(dom) => <WithdrawalForm {...{ selectedItem, dom, setOpen, message, setConfirmLoading }} />}
          >
            <div style={{ padding: '24px 0' }}>
              <Form.Item
                name="reason"
                label="Provide a payment reference"
                rules={[{ required: true, message: 'Please input the payment reference!' }]}
              >
                <Input />
              </Form.Item>
            </div>
          </Modal>
        )}
      </div>
    );
  },
  { displayName: BlockName },
);

const WithdrawalForm = ({ selectedItem, dom, setOpen, message, setConfirmLoading }) => {
  const api = useAPIClient();
  const [form] = Form.useForm();

  /**
   * methods
   */

  const onCreate = async (values: Values) => {
    setConfirmLoading(true);
    try {
      const response = await api.request({
        url: `finance:approve`,
        method: 'POST',
        params: {
          payment_ref: selectedItem.trans_ref,
          reason: values.reason,
        },
      });

      if (response?.data?.['data']) {
        message.success('Payment approved');
      }
    } catch (error) {
      message.error(error.message || 'Failed to approve withdrawal, try again!');
    } finally {
      setConfirmLoading(false);
      form.resetFields();
      setOpen(false);
    }
  };

  return (
    <Form
      method="POST"
      layout="vertical"
      form={form}
      name="form_in_modal"
      onReset={() => form.resetFields()}
      onFinish={(values) => onCreate(values)}
    >
      {dom}
    </Form>
  );
};

export default WithdrawalList;
