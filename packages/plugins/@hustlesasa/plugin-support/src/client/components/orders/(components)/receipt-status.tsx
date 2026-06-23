import React from 'react';
import { Col, Row } from 'antd';
import { format } from 'date-fns';

import { statusText } from '../../../lib';

function ReceiptStatus({ order }: { order: any }) {
  /**
   * constants
   */
  const orderInfo = [
    {
      label: 'Order Reference',
      value: order?.order_reference,
    },
    {
      label: 'Payment status',
      value: statusText(order?.status),
    },
    {
      label: 'Payment method',
      value: order?.payment_method_name,
    },
    {
      label: 'Order date',
      value: order?.payment_completed_at
        ? format(new Date(order?.payment_completed_at), 'dd MMM, yyyy')
        : format(new Date(order?.delivered_at), 'dd MMM, yyyy'),
    },
  ];

  return (
    <Row style={{ backgroundColor: '#fafafa', padding: '24px 16px' }}>
      {orderInfo?.map(({ label, value }) => (
        <Col span={6} key={label}>
          <dl>
            <dd style={{ fontSize: 14, color: '#344054', fontWeight: 400 }}>{label}</dd>
            <dt style={{ fontSize: 14, color: '#101928', fontWeight: 500 }}>{value}</dt>
          </dl>
        </Col>
      ))}
    </Row>
  );
}

export default ReceiptStatus;
