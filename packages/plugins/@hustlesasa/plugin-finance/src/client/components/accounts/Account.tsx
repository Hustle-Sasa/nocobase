import React from 'react';
import { useRequest } from '@nocobase/client';
import { Card, Descriptions, DescriptionsProps, Flex, Table, TableColumnsType, Typography } from 'antd';

import AccountOperations from './AccountOperations';
import AccountPayouts from './AccountPayouts';

export interface Wallet {
  avl_balance: number;
  total_sales: number;
}

function Account({ hustle }: any) {
  /**
   * api
   */
  const { data: response, loading } = useRequest<{ data?: Wallet }>(
    hustle && hustle.account
      ? {
          url: `finance:getWallet`,
          params: {
            account: hustle.account as string,
          },
        }
      : null,
    {
      refreshDeps: [hustle],
    },
  );

  const wallet: Wallet = response?.data ?? { avl_balance: 0, total_sales: 0 };

  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'Account',
      children: hustle?.account,
    },
    {
      key: '2',
      label: 'Balance',
      children: wallet?.avl_balance,
    },
    {
      key: '3',
      label: 'Country',
      children: hustle?.country?.name,
    },
  ];

  return (
    <Flex vertical gap={24}>
      <Card>
        <Descriptions title="Account Info" items={items} />
      </Card>
      <AccountOperations {...{ hustle }} />
      <AccountPayouts {...{ hustle }} />
    </Flex>
  );
}

export default Account;
