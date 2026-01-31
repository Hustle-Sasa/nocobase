import React from 'react';

import { Card, Divider, Flex } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

function PaymentDetails({ selectedItem }) {
  return (
    <Card title="Payment details">
      <p>
        <CreditCardOutlined />
        <span>
          {' '}
          Payment Method : <strong>{selectedItem.payment_method_name}</strong>
        </span>
      </p>
      <Divider />

      {[
        {
          name: 'Subtotal',
          value: selectedItem?.sub_total,
        },
        {
          name: 'Delivery cost',
          value: selectedItem?.delivery_amount,
        },
        {
          name: 'Discount amount',
          value: selectedItem?.discount_amount,
        },
        {
          name: 'Coupon code',
          value: selectedItem?.coupon_code,
        },
      ].map((item, key) => (
        <Flex align="center" justify="space-between" gap={16} key={key}>
          <p>
            <span>{item.name}</span>
          </p>

          <p>{item?.value ? `${selectedItem.currency} ${item.value}` : '-'}</p>
        </Flex>
      ))}

      <Divider />
      <Flex align="center" justify="space-between">
        <span>Total :</span>
        <span>
          {selectedItem.currency} {selectedItem?.total_amount}
        </span>
      </Flex>
    </Card>
  );
}

export default PaymentDetails;
