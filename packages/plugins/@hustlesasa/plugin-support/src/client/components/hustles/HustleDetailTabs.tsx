import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Flex, message, Popconfirm, Tabs, type TabsProps, Typography } from 'antd';
import { useAPIClient, useRequest } from '@nocobase/client';

import HustleDetail from './HustleDetail';
import Products from './Products';
import Users from './Users';

const { Title } = Typography;

function HustleDetailTabs({ selectedItem }) {
  /**
   * api
   */
  const { refresh } = useRequest<{ data: [] }>({
    url: `hustles:get/${selectedItem.shop_id}`,
  });

  /**
   * constants
   */
  const api = useAPIClient();
  const [messageApi, contextHolder] = message.useMessage();
  const isApproved = selectedItem.status === 1;

  const items: TabsProps['items'] = [
    {
      key: 'details',
      label: 'Details',
      children: <HustleDetail selectedItem={selectedItem} />,
    },
    {
      key: 'products',
      label: 'Products',
      children: <Products hustle={selectedItem.shop_id} />,
    },
    {
      key: 'users',
      label: 'Users',
      children: <Users account={selectedItem.account} />,
    },
  ];

  /**
   * method
   */

  const suspendAccount = async () => {
    const account = selectedItem.account;

    try {
      const response = await api.request({
        url: `hustles:suspend`,
        params: {
          account: account,
        },
      });

      if (response.data.data) {
        refresh();
        messageApi.success(response.data.data.message);
      }
    } catch (error) {
      return;
    }
  };

  return (
    <>
      {contextHolder}
      <Flex justify="space-between" gap={24}>
        <div>
          <Title level={2}>Hustle Details</Title>
        </div>

        {isApproved && (
          <Popconfirm
            title="Suspend this shop?"
            description="Are you sure you want to suspend this shop?"
            onConfirm={suspendAccount}
            placement="left"
            okText="Yes, suspend"
            cancelText="No"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          >
            <Button danger>Suspend account</Button>
          </Popconfirm>
        )}
      </Flex>
      <Tabs defaultActiveKey="details" items={items} />
    </>
  );
}

export default HustleDetailTabs;
