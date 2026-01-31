import React, { useState } from 'react';
import { useRequest } from '@nocobase/client';
import { Button, Modal, Spin, Table, TableColumnsType, Tag } from 'antd';

import ProductDetail from './products/ProductDetail';

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
  selling_price: SellingPrice4;
  actual_price: ActualPrice4;
  created_at: string;
}

export interface Cover {
  type: string;
  url: string;
}

export interface BannerAsset {
  type: string;
  url: string;
}

export interface Variant {
  selling_price: SellingPrice;
  actual_price: ActualPrice;
  type: string;
  extra_details: ExtraDetails;
  stock: number;
  description: string;
  title: string;
  default_currency: string;
  is_free: boolean;
  edit?: boolean;
  id: string;
  coupon_only: boolean;
  is_active: boolean;
}

export interface SellingPrice {
  GHS: number;
}

export interface ActualPrice {
  GHS: number;
}

export interface ExtraDetails {
  venue: string;
  end_date: string;
  end_time: string;
  start_date: string;
  start_time: string;
  coordinates: string;
  type: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface DefaultExtraDetails {
  venue: string;
  end_date: string;
  end_time: string;
  start_date: string;
  start_time: string;
  coordinates: string;
  type: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface DefaultVariant {
  selling_price: SellingPrice2;
  actual_price: ActualPrice2;
  type: string;
  extra_details: ExtraDetails2;
  stock: number;
  description: string;
  title: string;
  default_currency: string;
  is_free: boolean;
  id: string;
  coupon_only: boolean;
  is_active: boolean;
}

export interface SellingPrice2 {
  GHS: number;
}

export interface ActualPrice2 {
  GHS: number;
}

export interface ExtraDetails2 {
  venue: string;
  end_date: string;
  end_time: string;
  start_date: string;
  start_time: string;
  coordinates: string;
  type: string;
  no_per_purchase: number;
  is_complimentary: boolean;
}

export interface MinimumPrice {
  selling_price: SellingPrice3;
  actual_price: ActualPrice3;
}

export interface SellingPrice3 {
  GHS: number;
}

export interface ActualPrice3 {
  GHS: number;
}

export interface SellingPrice4 {
  GHS: number;
}

export interface ActualPrice4 {
  GHS: number;
}

function Products({ hustle }: { hustle: string }) {
  /**
   * state
   */
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  /**
   * api
   */
  const { data: response, loading } = useRequest<{ data: DataItem[]; meta: any }>(
    {
      url: 'hustles:listProducts',
      params: {
        shop_id: hustle,
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    },
    {
      debounceWait: 300,
      refreshDeps: [pagination.current, pagination.pageSize],
      onSuccess: (res) => {
        setPagination((prev) => ({
          ...prev,
          total: res?.data?.meta?.total || 0,
        }));
      },
    },
  );

  /**
   * variables
   */
  const data = response?.data?.['data'] || [];

  const columns: TableColumnsType<DataItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      responsive: ['md'],
      ellipsis: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (_: any, record: DataItem) => (
        <Button
          color="primary"
          type="link"
          onClick={() => {
            setSelectedItem(record);
            setModalVisible(true);
          }}
        >
          {record.title}
        </Button>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: 'Price',
      dataIndex: 'actual_price',
      key: 'actual_price',
      align: 'right' as const,
      width: 90,
      ellipsis: true,
      render: (_, record: DataItem) => (
        <>
          {record.default_currency} {Object.values(record?.default_variant?.actual_price || {})[0] || 0}
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
      render: (_, record: DataItem) => (
        <>
          {record.default_currency} {Object.values(record?.default_variant?.selling_price || {})[0] || 0}
        </>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'default_variant',
      key: 'stock',
      width: 80,
      ellipsis: true,
      align: 'right' as const,
      render: (default_variant: DefaultVariant) => <>{default_variant?.stock || 0}</>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (text: boolean) => (
        <Tag color={text === true ? 'green' : 'red'}>{text === true ? 'Active' : 'Offline'}</Tag>
      ),
    },
  ];

  /**
   * methods
   */
  // Update handleTableChange
  const handleTableChange = () => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current + 1,
      pageSize: pagination.pageSize,
    }));
  };

  if (!data && loading) {
    return <Spin />;
  }

  return (
    <div style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="large"
        scroll={{ x: 800 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showPrevNextJumpers: true,
          showQuickJumper: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: handleTableChange,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      <Modal
        footer={false}
        open={modalVisible}
        onCancel={() => {
          setSelectedItem(null);
          setModalVisible(false);
        }}
        width={typeof window !== 'undefined' && window.innerWidth >= 992 ? '50%' : '100%'}
        style={{
          maxWidth: '100vw',
        }}
      >
        {selectedItem && <ProductDetail selectedItem={selectedItem} />}
      </Modal>
    </div>
  );
}

export default Products;
