import React from 'react';

import { Card, Table, Flex, Typography, Tag, Avatar, TableColumnsType } from 'antd';
import { status, statusText } from '../../lib';

function OrderItems({ selectedItem }) {
  const { Text } = Typography;

  /**
   * variables
   */
  const lengthOfItems = selectedItem?.order_items?.length || 0;
  const dataSource = selectedItem?.order_items;

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'product_name',
      key: 'product_name',
      ellipsis: true,
      render: (_: any, record: any) => (
        <Flex wrap="wrap" align="center" gap={8}>
          <Avatar
            shape="square"
            size={40}
            src={record?.product_cover?.url}
            style={{ borderRadius: 4, backgroundColor: '#F0F2F5' }}
          />
          <Flex wrap="wrap" gap={4}>
            <Text ellipsis>{record.product_name}</Text>
            <div>
              {record.product_variant_name && <span>{record.product_variant_name}</span>}{' '}
              {record.extra_details.type && (
                <>
                  &#x2219; <span>{record.extra_details.type}</span>
                </>
              )}
            </div>
          </Flex>
        </Flex>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 200,
      ellipsis: true,
      align: 'right' as const,
      render: (_, record: any) => (
        <span>
          {selectedItem.currency} {record.unit_price} x {record.quantity}
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'line_total',
      key: 'line_total',
      width: 100,
      ellipsis: true,
      responsive: ['md'],
      align: 'right' as const,
      render: (_, record: any) => (
        <span>
          {selectedItem.currency} {Number(record.unit_price) * record.quantity}
        </span>
      ),
    },
  ];

  return (
    <Card
      title={`Order Items: ${lengthOfItems}`}
      extra={
        <Tag
          color={status(selectedItem?.status)?.color}
          style={{ color: status(selectedItem?.status)?.text, fontWeight: 500, borderRadius: 16 }}
        >
          {statusText(selectedItem?.status)}
        </Tag>
      }
    >
      <Table dataSource={dataSource} columns={columns} rowKey="product_name" pagination={false} />
    </Card>
  );
}

export default OrderItems;
