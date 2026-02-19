import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Flex, message, Popconfirm, Tabs, type TabsProps, Typography } from 'antd';
import { useAPIClient, useRequest, useCurrentRoles } from '@nocobase/client';

import HustleDetail from './HustleDetail';
import Products from './Products';
import Users from './Users';

const { Title } = Typography;

function HustleDetailTabs({ selectedItem, onClose }: { selectedItem: any; onClose: () => void }) {
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
  const roles = useCurrentRoles();

  // console.log(roles);

  const [messageApi, contextHolder] = message.useMessage();
  const isApproved = selectedItem.status === 1;

  const hasFinancialAccess =
    Array.isArray(roles) &&
    roles.some((role: any) => {
      const nameCheck = typeof role?.name === 'string' ? role.name : undefined;
      const titleCheck = typeof role?.title === 'string' ? role.title : undefined;
      const roleName = nameCheck || titleCheck;
      return roleName?.toLowerCase() === 'finance';
    });

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
      console.error('Failed to suspend account:', error);
      messageApi.error('Failed to suspend account');
    }
  };

  return (
    <>
      {contextHolder}
      <Flex justify="space-between" gap={24}>
        <div>
          <Title level={2}>Hustle Details</Title>
        </div>

        <Flex gap={8}>
          {hasFinancialAccess && (
            <Button
              type="primary"
              onClick={() => {
                onClose();
                globalThis.location.href = `/admin/rnnllgtopdw?hustleId=${selectedItem.shop_id}`;
              }}
            >
              Visit Account Manager
            </Button>
          )}

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
      </Flex>
      <Tabs defaultActiveKey="details" items={items} />
    </>
  );
}

export default HustleDetailTabs;
