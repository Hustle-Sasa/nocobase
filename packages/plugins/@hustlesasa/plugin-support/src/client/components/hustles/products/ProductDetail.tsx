import React from 'react';
import { useRequest } from '@nocobase/client';
import { Avatar, Col, Divider, Flex, Row, Skeleton, Space, Table, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

export interface DataItem {
  id: string;
  title: string;
  cover: Cover;
  description: string;
  banner_assets: BannerAsset[];
  manage_inventory: boolean;
  low_stock_alert: boolean;
  is_active: boolean;
  product_type: string;
  country: string;
  default_currency: string;
  variants: Variant[];
  has_variants: boolean;
  default_extra_details: DefaultExtraDetails;
  submit_to_marketplace: boolean;
  approved_to_marketplace: boolean;
  custom_fields: any[];
  category: any;
  related_products: any[];
  store_id: string;
  default_variant: DefaultVariant;
  minimum_price: MinimumPrice;
  selling_price: SellingPrice2;
  actual_price: ActualPrice4;
  created_at: string;
}

export interface Cover {
  url: string;
  type: string;
  file: string;
}

export interface BannerAsset {
  url: string;
  type: string;
  file: string;
}

export interface Variant {
  actual_price: ActualPrice;
  selling_price: SellingPrice;
  extra_details: ExtraDetails;
  stock: number;
  description: string;
  title: string;
  default_currency: string;
  is_free: boolean;
  edit: boolean;
  id: string;
  coupon_only: boolean;
  is_active: boolean;
}

export interface ActualPrice {
  GHS: number;
}

export interface ExtraDetails {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  coordinates: string;
  type: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface DefaultExtraDetails {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  coordinates: string;
  type: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface DefaultVariant {
  actual_price: ActualPrice2;
  selling_price: SellingPrice;
  extra_details: ExtraDetails2;
  stock: number;
  description: string;
  title: string;
  default_currency: string;
  is_free: boolean;
  edit: boolean;
  id: string;
  coupon_only: boolean;
  is_active: boolean;
}

export interface ActualPrice2 {
  GHS: number;
}

export interface ExtraDetails2 {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  coordinates: string;
  type: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface MinimumPrice {
  selling_price: SellingPrice;
  actual_price: ActualPrice3;
}

export interface SellingPrice {}

export interface ActualPrice3 {
  GHS: number;
}

export interface SellingPrice2 {}

export interface ActualPrice4 {
  GHS: number;
}

function ProductDetail({ selectedItem }) {
  /**
   * api
   */
  const { data: response, loading } = useRequest<{ data: DataItem }>(
    {
      url: `hustles:getProduct/${selectedItem.id}`,
      params: {
        store_id: selectedItem.store_id,
      },
    },
    {
      refreshDeps: [selectedItem.id, selectedItem.store_id],
    },
  );

  /**
   * variables
   */
  const product: DataItem = response?.data?.['data'] || {};
  const actualPrice = Object.values(product?.default_variant?.actual_price || {})[0];
  const sellingPrice = Object.values(product?.default_variant?.selling_price || {})[0];
  const hasVariants = product?.has_variants;
  const variants = product?.variants;
  const currency = product?.default_currency;
  const isEvent = product?.product_type?.toLowerCase() === 'event';

  // variants

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Price',
      dataIndex: 'actual_price',
      key: 'actual_price',
      align: 'right' as const,
      width: 90,
      ellipsis: true,
      render: (_: any, record: Variant) => (
        <>
          {currency} {Object.values(record?.actual_price || {})[0] || 0}
        </>
      ),
    },
    {
      title: 'Sale',
      dataIndex: 'selling_price',
      key: 'selling_price',
      align: 'right' as const,
      width: 90,
      ellipsis: true,
      render: (_: any, record: Variant) => (
        <>
          {currency} {Object.values(record?.selling_price || {})[0] || 0}
        </>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      ellipsis: true,
      align: 'right' as const,
      render: (stock: number) => <>{stock || 0}</>,
    },
  ];

  if (!response && loading) {
    return (
      <Flex vertical gap={3}>
        <Skeleton active />
        <Skeleton active />
      </Flex>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Row gutter={40}>
        <Col xs={24} md={12}>
          <Flex vertical gap={4}>
            <Typography.Title level={3}>{product?.title}</Typography.Title>

            {isEvent ? (
              <Flex vertical gap={8} style={{ marginBottom: 8 }}>
                <Flex vertical>
                  <Typography.Paragraph>
                    Start :{' '}
                    {format(
                      new Date(product?.default_extra_details?.start_date),
                      `dd MMM yyyy, ${product?.default_extra_details?.start_time}`,
                    )}
                  </Typography.Paragraph>
                  <Typography.Paragraph>End: {product?.default_extra_details?.end_date}</Typography.Paragraph>
                </Flex>
                <Flex wrap="wrap" gap={4} align="flex-start">
                  <EnvironmentOutlined />
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {product?.default_extra_details?.venue}
                  </Typography.Paragraph>
                </Flex>
              </Flex>
            ) : (
              <Space>
                <Typography.Title level={5} style={{ textDecoration: sellingPrice && 'line-through' }}>
                  {product.default_currency} {actualPrice || 0}
                </Typography.Title>

                {sellingPrice ? (
                  <Typography.Title level={5}>
                    {product.default_currency} {sellingPrice || 0}
                  </Typography.Title>
                ) : null}
              </Space>
            )}

            <Typography.Paragraph>{product?.description}</Typography.Paragraph>
          </Flex>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ aspectRatio: 1 / 1, overflow: 'hidden', width: '100%', height: '100%' }}>
            <Avatar
              shape="square"
              size={{ md: 300 }}
              src={product?.cover?.url}
              style={{ aspectRatio: 1 / 1, borderRadius: 8, backgroundColor: '#F0F2F5', width: '100%', height: '100%' }}
            />
          </div>
        </Col>
      </Row>

      {(hasVariants || isEvent) && (
        <>
          <Typography.Title level={5}>Variants</Typography.Title>
          <Divider />
          <Table dataSource={variants} columns={columns} rowKey="id" pagination={false} footer={undefined} />
        </>
      )}
    </div>
  );
}

export default ProductDetail;
