import React from 'react';
import { Typography } from 'antd';

import ReceiptLineItems from './receipt-line-items';
import ReceiptAddress from './receipt-address';
import ReceiptStatus from './receipt-status';

import { DataItem } from '../type';
import ReceiptHeader from './receipt-header';

const { Text, Title } = Typography;

function ReceiptContent({ order, hustle }: { order: DataItem; hustle?: any }) {
  return (
    <>
      <ReceiptHeader {...{ order, hustleInitials: hustle?.title?.slice(0, 1) ?? '' }} />

      <div style={{ backgroundColor: '#FAFAFA', padding: '16px 32px' }}>
        <Title level={4} style={{ marginBottom: 8, color: '#120D18' }}>
          Hello {order?.buyer?.full_name}, thank you for your order!
        </Title>
        <Text style={{ color: '#322644' }}>
          If you have any questions contact {hustle?.title} via {hustle?.phone} or {hustle?.email}
        </Text>
      </div>

      <ReceiptAddress {...{ order, hustle }} />
      <ReceiptStatus {...{ order }} />
      <ReceiptLineItems {...{ order }} />
    </>
  );
}

export default ReceiptContent;
