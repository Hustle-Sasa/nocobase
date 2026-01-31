import React, { useState } from 'react';
import { useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { Button, Card, Empty, Form, Input, Skeleton, Typography } from 'antd';

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
    const [searchText, setSearchText] = useState('');
    const [hustleDetail, setHustleDetail] = useState<DataItem | null>(null);

    /**
     *
     */

    // Fetch account details when searchText is provided
    const { data: response, loading } = useRequest<{ data: any }>(
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
      },
    );

    /**
     * variables
     */
    const hustle = response?.data?.['data'] || {};

    const onFinish = (values: { search: string }) => setSearchText(values.search);

    return (
      <div style={{ padding: 24 }}>
        <Card title="Search hustle" style={{ padding: '24px 0' }}>
          <Form
            name="basic"
            layout="vertical"
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Hustle ID"
              name="search"
              rules={[{ required: true, message: 'Please input the Hustle ID!' }]}
            >
              <Input.Search
                allowClear
                value={searchText}
                onSearch={() => {
                  onFinish({ search: searchText });
                }}
              />
            </Form.Item>

            <Form.Item label={null}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <div style={{ padding: '48px 0' }}>
          {loading && <Skeleton active paragraph={{ rows: 6 }} />}

          {!loading && !hustle && (
            <Empty
              description={
                <Typography.Text>Shop information will be displayed here once you enter a shop ID</Typography.Text>
              }
            />
          )}

          {hustle && Object.keys(hustle).length > 0 && <Account hustle={hustleDetail} />}
        </div>
      </div>
    );
  },
  { displayName: BlockName },
);

export default AccountManager;
