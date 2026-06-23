import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import { DataItem } from '../type';

export default function ReceiptLineItems({ order }: { order: DataItem }) {
  /**
   * constants
   */

  const retailItemVariants = new Set(['retail', 'food & drinks', 'food_drinks']);

  const orderHasRetailItems = Boolean(
    order?.order_items?.filter((item: any) => retailItemVariants.has(item?.product_type?.toLowerCase?.())).length,
  );

  const total = Number(order?.sub_total) + Number(order?.delivery_amount) + Math.ceil(Number(order?.service_fee)) - Number((order?.discount_amount) ?? 0); // prettier-ignore

  const tableFooterItems = [
    {
      label: 'Subtotal',
      value: order?.sub_total,
    },
    {
      label: 'Discount',
      value: order?.discount_amount,
    },
    {
      label: 'Service charge',
      value: Math.ceil(Number(order?.service_fee ?? 0)),
    },
    ...(orderHasRetailItems
      ? [
          {
            label: 'Shipping',
            value: order.delivery_amount,
          },
        ]
      : []),

    {
      label: 'Total Amount',
      total: true,
      value: total,
    },
  ];

  const headerCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: 12,
    fontWeight: 500,
    color: '#667085',
    textTransform: 'uppercase',
    borderBottom: '1px solid #E4E7EC',
    textAlign: 'left',
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: '16px',
    fontSize: 14,
    color: '#344054',
    borderBottom: '1px solid #F0F2F5',
    verticalAlign: 'top',
  };

  return (
    <div style={{ paddingTop: 40 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th scope="col" style={{ ...headerCellStyle }}>
              Order information
            </th>
            <th scope="col" style={{ ...headerCellStyle }}>
              Product Type
            </th>
            <th scope="col" style={{ ...headerCellStyle, textAlign: 'right' }}>
              QTY
            </th>
            <th scope="col" style={{ ...headerCellStyle, textAlign: 'right' }}>
              Unit cost
            </th>
            <th scope="col" style={{ ...headerCellStyle, textAlign: 'right' }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order?.order_items?.map((item: any) => (
            <tr key={item.id}>
              <td style={bodyCellStyle}>
                <p style={{ fontWeight: 500, color: '#344054', margin: 0 }}>{item.product_name}</p>

                {(item?.product_variant_name || item?.extra_details?.type) && (
                  <p style={{ marginTop: 4, marginBottom: 0, color: '#667185', fontSize: 13 }}>
                    {item?.product_variant_name && <span>Variant: {item.product_variant_name}</span>}

                    {item?.product_variant_name && item?.extra_details?.type && ' · '}

                    {item?.extra_details?.type && <span>Ticket type: {item.extra_details.type}</span>}
                  </p>
                )}
              </td>
              <td style={{ ...bodyCellStyle, textTransform: 'capitalize' }}>{item?.product_type}</td>
              <td style={{ ...bodyCellStyle, textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ ...bodyCellStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {order.currency}
                {Number(item.unit_price)}
              </td>
              <td style={{ ...bodyCellStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {order.currency}
                {Number(item?.unit_price ?? 0) * Number(item?.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ padding: '40px 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '100%', maxWidth: 320 }}>
          {tableFooterItems.map((item) => (
            <dl
              key={item.label}
              style={{
                borderTopWidth: item?.total ? 1 : 0,
                borderTopStyle: item?.total ? 'dashed' : 'none',
                textTransform: 'capitalize',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <dt
                style={{
                  color: item?.total ? '#344054' : '#667185',
                  fontWeight: item?.total ? 'bold' : 'normal',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {item?.label}
                {item.label === 'Service charge' && (
                  <Tooltip title="Covers payment processing fee and VAT" style={{ gap: 2 }}>
                    <InfoCircleOutlined style={{ fontSize: 14 }} />
                  </Tooltip>
                )}
              </dt>
              <dd style={{ fontSize: 14, color: '#667185', fontWeight: 400 }}>
                {order.currency}
                {Number(item.value || 0)}
              </dd>
            </dl>
          ))}
        </div>
      </div>
    </div>
  );
}
