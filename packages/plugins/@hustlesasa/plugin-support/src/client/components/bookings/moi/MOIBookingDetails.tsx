import React, { useState } from 'react';
import { Button, Drawer, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { Detail, Order } from './type';
import { formatMoney } from '../../../lib';
import { RescheduleForm } from './RescheduleForm';

interface MOIBookingDetailsProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onRescheduleSuccess?: () => void;
}

export const MOIBookingDetails: React.FC<MOIBookingDetailsProps> = ({ open, order, onClose, onRescheduleSuccess }) => {
  /**
   * state
   */
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  /**
   * methods
   */
  const handleEditClick = (detail: Detail) => {
    setSelectedVariantId(detail.variant?.id ?? null);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSuccess = () => {
    onRescheduleSuccess?.();
    onClose();
  };

  return (
    <>
      <Drawer
        title={`Order #${order?.order_ref || ''}`}
        open={open}
        onClose={onClose}
        width={typeof window !== 'undefined' && window.innerWidth >= 992 ? '50%' : '100%'}
      >
        {order?.details?.length ? (
          <Table
            dataSource={order.details}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Product',
                dataIndex: ['product', 'title'],
                key: 'product',
                ellipsis: true,
              },
              {
                title: 'Variant',
                dataIndex: ['variant', 'title'],
                key: 'variant',
                render: (text: string) => text || '-',
              },
              {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
                align: 'right' as const,
                render: (price: number) => formatMoney(price, order.currency),
              },
              {
                title: 'Qty',
                dataIndex: 'qty',
                key: 'qty',
                align: 'center' as const,
                width: 60,
              },
              {
                title: '',
                key: 'action',
                width: 100,
                render: (_: any, record: Detail) => (
                  <Button type="default" icon={<EditOutlined />} onClick={() => handleEditClick(record)}>
                    Edit
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <p>No order details available.</p>
        )}
      </Drawer>

      <RescheduleForm
        open={rescheduleModalOpen}
        variantId={selectedVariantId}
        onClose={() => setRescheduleModalOpen(false)}
        onSuccess={handleRescheduleSuccess}
      />
    </>
  );
};

export default MOIBookingDetails;
