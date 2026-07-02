import React, { useRef } from 'react';
import { Button, Card, Flex, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useRequest } from '@nocobase/client';

import type { DataItem } from './OrderDetail';
import ReceiptContent from './(components)/receipt-content';

function Receipts({ selectedItem }: { selectedItem?: DataItem }) {
  /**
   * state
   */
  const receiptRef = useRef<HTMLDivElement>(null);

  /**
   * variables
   */
  const shop_id = selectedItem?.hustle_ids?.[0];

  /**
   * apis
   */
  const { data: response } = useRequest<{ data: any }>({
    url: `orders:getHustle/${shop_id}`,
  });

  const hustle = response?.data?.['data'] ?? {};

  const downloadReceipt = async () => {
    if (!selectedItem || !receiptRef.current) return;

    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(receiptRef.current, { scrollY: -window.scrollY, useCORS: true });
    const link = document.createElement('a');
    link.download = 'order-receipt.jpg';
    link.href = canvas.toDataURL('image/jpeg', 1);
    link.click();
  };

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Typography.Title level={4}>Receipt</Typography.Title>
        <Button icon={<DownloadOutlined />} type="link" onClick={downloadReceipt} disabled={!selectedItem}>
          Download receipt
        </Button>
      </Flex>
      <Card bodyStyle={{ padding: '12px 0' }}>
        {selectedItem ? (
          <div ref={receiptRef}>
            <ReceiptContent order={selectedItem} hustle={hustle} />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

export default Receipts;
