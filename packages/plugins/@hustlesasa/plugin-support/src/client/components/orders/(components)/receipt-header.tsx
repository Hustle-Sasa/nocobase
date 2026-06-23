import React from 'react';
import { Avatar, Flex, Typography } from 'antd';

import { DataItem } from '../type';

const { Text } = Typography;

function ReceiptHeader({ order, hustleInitials }: { order: DataItem; hustleInitials: string }) {
  return (
    <Flex align="center" justify="space-between" gap={12} style={{ padding: 24 }}>
      <Flex align="center" gap={12}>
        <Avatar shape="square" size={56} style={{ backgroundColor: '#e7f6ec', color: '#59c3b6' }}>
          {hustleInitials}
        </Avatar>
        <Flex vertical gap={0}>
          <Text strong style={{ color: '#344054' }}>
            {order?.buyer?.full_name}
          </Text>
          <Flex align="center" gap={8}>
            <Text style={{ color: '#667185', fontSize: 13 }}>{order?.buyer?.email}</Text>
            <span style={{ borderLeft: '1px solid #E4E7EC', height: 12 }} />
            <Text style={{ color: '#667185', fontSize: 13 }}>{order?.buyer?.phone}</Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex vertical gap={0} align="end" style={{ borderLeft: '1px solid #E4E7EC', paddingLeft: 24 }}>
        <Text style={{ color: '#667085', fontSize: 12, fontWeight: 400, textTransform: 'uppercase' }}>
          Payment method
        </Text>
        <Text style={{ color: '#344054', fontWeight: 700 }}>{order?.payment_method_name}</Text>
      </Flex>
    </Flex>
  );
}

export default ReceiptHeader;
