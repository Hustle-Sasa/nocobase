import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { Card, Empty, Form, Input, Skeleton, Typography } from 'antd';

import { BlockName } from './constant';
import Account from './Account';

export interface DataItem {
  trans_ref: string;
  amount: number;
  payee_account: string;
  date: string;
  merchant_tax: number;
  details: string;
  debited: number;
}

export const AccountManager = withDynamicSchemaProps(
  () => {
    /***
     * state
     */
    const location = useLocation();
    const [, setSearchParams] = useSearchParams();
    const [searchText, setSearchText] = useState(
      () => new URLSearchParams(globalThis.location.search).get('hustleId') ?? '',
    );
    const [hustleDetail, setHustleDetail] = useState<DataItem | null>(null);

    /**
     * effects
     */
    useEffect(() => {
      const hustleId = new URLSearchParams(location.search).get('hustleId') ?? '';
      setSearchText(hustleId);
    }, [location.search]);

    /***
     * methods
     */
    // Fetch account details when searchText is provided — automatically
    const { loading } = useRequest<{ data: any }>(
      searchText
        ? {
            url: 'finance:get',
            params: {
              id: searchText,
            },
          }
        : null,
      {
        debounceWait: 400,
        refreshDeps: [searchText],
        onSuccess: (res) => {
          setHustleDetail(res?.data?.data);
        },
        onError: () => {
          setHustleDetail(null);
        },
      },
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value) {
        setSearchText(value);
        setSearchParams({ hustleId: value }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
        setSearchText('');
        setHustleDetail(null);
      }
    };

    return (
      <div style={{ padding: 24 }}>
        <Card title="Search hustle" style={{ padding: '24px 0' }}>
          <Form layout="vertical" style={{ maxWidth: 600 }} autoComplete="off">
            <Form.Item label="Hustle ID">
              <Input.Search allowClear value={searchText} onChange={handleChange} />
            </Form.Item>
          </Form>
        </Card>

        <div style={{ padding: '48px 0' }}>
          {loading && <Skeleton active paragraph={{ rows: 6 }} />}

          {!loading && !hustleDetail && (
            <Empty
              description={
                <Typography.Text>Shop information will be displayed here once you enter a shop ID</Typography.Text>
              }
            />
          )}

          {hustleDetail && <Account hustle={hustleDetail} />}
        </div>
      </div>
    );
  },
  { displayName: BlockName },
);

export default AccountManager;
