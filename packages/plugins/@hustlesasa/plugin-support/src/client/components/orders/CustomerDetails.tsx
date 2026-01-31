import React from 'react';

import { Card, Flex, Skeleton } from 'antd';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest } from '@nocobase/client';

function BuyerInfo({ selectedItem }) {
  const shop_id = selectedItem?.hustle_ids?.[0];

  /**
   * api
   */
  const { data: response, loading } = useRequest<{ data: [] }>({
    url: `orders:getHustle/${shop_id}`,
  });

  const merchant = response?.data?.['data'] || {};

  if (loading) {
    <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <Flex vertical gap={24}>
      <Card title="Customer details">
        {[
          {
            name: 'Name',
            icon: UserOutlined,
            value: selectedItem?.buyer?.full_name,
          },
          {
            name: 'Mobile',
            icon: PhoneOutlined,
            value: selectedItem?.buyer?.phone,
          },
          {
            name: 'Email',
            icon: MailOutlined,
            value: selectedItem?.buyer?.email,
          },
          {
            name: 'Address',
            icon: EnvironmentOutlined,
            value: selectedItem?.delivery_address,
          },
        ].map((item, key) => (
          <Flex align="center" justify="space-between" gap={16} key={key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>
                <item.icon size={16} className="" />
              </span>
              <span>{item.name}:</span>
            </div>

            <p>{item.value || '-'}</p>
          </Flex>
        ))}
      </Card>

      <Card title="Merchant details">
        {[
          {
            name: 'Name',
            icon: UserOutlined,
            value: merchant.title,
          },
          {
            name: 'Mobile',
            icon: PhoneOutlined,
            value: merchant?.phone,
          },
          {
            name: 'Email',
            icon: MailOutlined,
            value: merchant.email,
          },
          {
            name: 'Address',
            icon: EnvironmentOutlined,
            value: merchant.location,
          },
        ].map((item, key) => (
          <Flex align="center" justify="space-between" gap={16} key={key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>
                <item.icon size={16} className="" />
              </span>
              <span>{item.name}:</span>
            </div>

            <p>{item.value || '-'}</p>
          </Flex>
        ))}
      </Card>
    </Flex>
  );
}

export default BuyerInfo;
