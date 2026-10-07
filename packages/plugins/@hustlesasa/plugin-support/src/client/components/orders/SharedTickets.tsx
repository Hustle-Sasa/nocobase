import React, { useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Spin,
  Statistic,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useAPIClient, useRequest } from '@nocobase/client';
import { format } from 'date-fns';
import { startCase } from 'lodash';

import { useEnvironment } from '../(shared)/use-environment-settings';
import { ticketStatus, ticketStatusText } from '../../lib';

export interface SharedTicket {
  id: string;
  ticket_id: string;
  status: string;
  cancellable: boolean;
  original_customer_name?: string;
  original_customer_email?: string;
  original_customer_phone?: string;
  new_customer_name?: string;
  new_customer_email?: string;
  new_customer_phone?: string;
  created_at: string;
  expires_at?: string;
  accepted_at?: string | null;
}

export interface SharedTicketsResponse {
  shares: SharedTicket[];
  ticket_count: number;
  share_count: number;
}

const SHARE_STATUS_COLORS: Record<string, string> = {
  accepted: 'success',
  pending: 'warning',
  cancelled: 'error',
  expired: 'default',
};

const formatDate = (value?: string | null) => (value ? format(new Date(value), 'dd MMM yyyy, HH:mm a') : '-');

const Customer = ({ name, email, phone }: { name?: string; email?: string; phone?: string }) => (
  <Flex vertical>
    <span>{name || '-'}</span>
    {email && <small>{email}</small>}
    {phone && <small>{phone}</small>}
  </Flex>
);

function SharedTickets({ order }: { order?: string }) {
  /**
   * state
   */
  const [form] = Form.useForm();
  const [shareToCancel, setShareToCancel] = useState<SharedTicket | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * api
   */
  const api = useAPIClient();
  const environment = useEnvironment();
  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{ data: { data: SharedTicketsResponse } }>(
    {
      url: 'orders:listSharedTickets',
      params: {
        order_reference: order,
        env: environment,
      },
    },
    {
      ready: !!order,
      refreshDeps: [order, environment],
    },
  );

  /**
   * variables
   */
  const summary = response?.data?.['data'];
  const data = summary?.shares || [];

  const columns: TableColumnsType<SharedTicket> = [
    {
      title: 'Shared from',
      key: 'original_customer',
      render: (_, record) => (
        <Customer
          name={record.original_customer_name}
          email={record.original_customer_email}
          phone={record.original_customer_phone}
        />
      ),
    },
    {
      title: 'Shared with',
      key: 'new_customer',
      render: (_, record) => (
        <Customer name={record.new_customer_name} email={record.new_customer_email} phone={record.new_customer_phone} />
      ),
    },
    {
      title: 'Ticket ID',
      dataIndex: 'ticket_id',
      key: 'ticket_id',
      responsive: ['xl'],
      render: (text: string) => <Typography.Text copyable={!!text}>{text || '-'}</Typography.Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) =>
        text ? (
          <Tag
            color={ticketStatus(text.toUpperCase()).color}
            style={{
              color: ticketStatus(text.toUpperCase()).text,
            }}
          >
            {ticketStatusText(text.toUpperCase())}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Shared at',
      dataIndex: 'created_at',
      key: 'created_at',
      responsive: ['md'],
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Accepted / Expires',
      key: 'accepted_or_expires',
      responsive: ['lg'],
      render: (_, record) =>
        record.accepted_at ? (
          <span>Accepted {formatDate(record.accepted_at)}</span>
        ) : (
          <Typography.Text type="secondary">Expires {formatDate(record.expires_at)}</Typography.Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        record.cancellable ? (
          <Button danger onClick={() => setShareToCancel(record)}>
            Cancel
          </Button>
        ) : (
          <Tooltip title="This shared ticket can no longer be cancelled">
            <Button danger disabled>
              Cancel
            </Button>
          </Tooltip>
        ),
    },
  ];

  /**
   * methods
   */
  const closeCancelModal = () => {
    form.resetFields();
    setShareToCancel(null);
  };

  const cancelShare = async ({ reason }: { reason: string }) => {
    if (!shareToCancel) return;

    setCancelling(true);
    try {
      await api.request({
        url: 'orders:cancelSharedTicket',
        method: 'POST',
        params: {
          order_reference: order,
          share_id: shareToCancel.id,
          env: environment,
          reason,
        },
      });

      closeCancelModal();
      refresh();
      messageApi.success('Shared ticket cancelled');
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message;
      messageApi.error(errorMsg || error.message || 'Failed to cancel shared ticket');
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !response) {
    return (
      <Flex gap="middle" vertical style={{ paddingTop: 24 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <div style={{ paddingTop: 16 }}>
      {contextHolder}
      <Flex gap={16} wrap="wrap" style={{ marginBottom: 16 }}>
        <Card size="small" style={{ minWidth: 160 }}>
          <Statistic title="Tickets" value={summary?.ticket_count ?? 0} />
        </Card>
        <Card size="small" style={{ minWidth: 160 }}>
          <Statistic title="Shares" value={summary?.share_count ?? 0} />
        </Card>
      </Flex>
      <Table scroll={{ x: 800 }} columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal
        title="Cancel shared ticket"
        open={!!shareToCancel}
        onCancel={closeCancelModal}
        footer={null}
        destroyOnClose
      >
        <Typography.Paragraph type="secondary">
          {startCase(shareToCancel?.new_customer_name) || 'The recipient'} will no longer have access to this ticket.
        </Typography.Paragraph>

        <Form form={form} layout="vertical" onFinish={cancelShare} preserve={false}>
          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, whitespace: true, message: 'Please enter the reason for cancelling' }]}
          >
            <Input.TextArea rows={4} placeholder="Why is this shared ticket being cancelled?" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button danger type="primary" htmlType="submit" block loading={cancelling}>
              Cancel shared ticket
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SharedTickets;
