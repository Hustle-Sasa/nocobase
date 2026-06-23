import React from 'react';
import { Col, Row } from 'antd';

import { DataItem } from '../type';

function ReceiptAddress({ order, hustle }: { order: DataItem; hustle?: any }) {
  /**
   * constants
   */
  const buyerCountryCode = order?.buyer?.phone.slice(0, 4);
  const buyerPhoneNumber = order?.buyer?.phone?.substring(4);

  return (
    <Row gutter={24} style={{ padding: '40px 32px 24px' }}>
      <Col order={2} span={12}>
        <address className="space-y-6" style={{ fontStyle: 'normal' }}>
          <dl>
            <dt style={{ fontSize: 12, color: '#667185', fontWeight: 400 }}>Merchant Name</dt>
            <dd style={{ fontSize: 14, color: '#344054', fontWeight: 600, textDecoration: 'capitalize' }}>
              {hustle?.title}
            </dd>
          </dl>

          {hustle?.email && (
            <dl>
              <dt style={{ fontSize: 12, color: '#667185', fontWeight: 400 }}>Email Address</dt>
              <dd
                style={{
                  fontSize: 14,
                  color: '#344054',
                  fontWeight: 600,
                  marginTop: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={hustle?.email}
              >
                {hustle?.email}
              </dd>
            </dl>
          )}

          {hustle?.location && (
            <dl>
              <dt style={{ fontSize: 12, color: '#667185', fontWeight: 400 }}>Location</dt>
              <dd style={{ fontSize: 14, color: '#344054', fontWeight: 600, marginTop: 4 }}>{hustle?.location}</dd>
            </dl>
          )}

          <dl>
            <dt style={{ fontSize: 12, color: '#667185', fontWeight: 400 }}>Telephone</dt>
            <dd
              style={{ fontSize: 14, color: '#344054', fontWeight: 600, marginTop: 4 }}
            >{`(+${hustle?.country?.callingCode}) ${hustle?.phone}`}</dd>
          </dl>
        </address>
      </Col>
      <Col order={1} span={12}>
        <address>
          <dl>
            <dt style={{ fontSize: 12, color: '#667185', fontWeight: 400 }}>Customer Name</dt>
            <dd style={{ fontSize: 14, color: '#344054', fontWeight: 600 }}>{order?.buyer?.full_name}</dd>
          </dl>
          {order?.buyer?.email && (
            <dl>
              <dt style={{ fontSize: 12, color: '#667185', fontWeight: 400 }}>Email Address</dt>
              <dd
                style={{
                  fontSize: 14,
                  color: '#344054',
                  fontWeight: 600,
                  marginTop: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {order?.buyer?.email}
              </dd>
            </dl>
          )}
          <dl>
            <dt style={{ fontSize: 12, color: '#667185', fontWeight: 400 }}>Telephone</dt>
            <dd
              style={{ fontSize: 14, color: '#344054', fontWeight: 600, marginTop: 4 }}
            >{`(${buyerCountryCode}) ${buyerPhoneNumber}`}</dd>
          </dl>
        </address>
      </Col>
    </Row>
  );
}

export default ReceiptAddress;
