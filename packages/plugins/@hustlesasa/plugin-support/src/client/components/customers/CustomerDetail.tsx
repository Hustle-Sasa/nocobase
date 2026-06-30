import React from 'react';
import { Avatar, Col, Divider, Flex, Row, Tag, Typography } from 'antd';

import { Customer } from './type';

const { Title } = Typography;

interface Props {
  customer: Customer;
}

interface DescriptionItemProps {
  title: string;
  content: React.ReactNode;
}

const DescriptionItem = ({ title, content }: DescriptionItemProps) => (
  <Flex vertical gap={8} style={{ marginBottom: 16 }}>
    <span style={{ color: '#667185' }}>{title}:</span>
    <span style={{ color: '#1D2739' }}>{content}</span>
  </Flex>
);

const CustomerDetail: React.FC<Props> = ({ customer }) => {
  const initials = customer.fullname
    ? customer.fullname
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <Flex vertical style={{ paddingTop: 16 }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        General Information
      </Title>

      <Flex gap={8} style={{ marginBottom: 24 }}>
        <Avatar size={48}>{initials}</Avatar>
        <Flex vertical gap={4}>
          <span style={{ fontWeight: 600, color: '#1D2739' }}>{customer.fullname || 'N/A'}</span>
          <span style={{ color: '#667185' }}>{customer.email || 'N/A'}</span>
        </Flex>
      </Flex>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem title="Full Name" content={customer.fullname || 'N/A'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Phone" content={customer.phone || 'N/A'} />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem title="Email" content={customer.email || 'N/A'} />
        </Col>
        <Col span={12}>
          <DescriptionItem
            title="App Downloaded"
            content={
              <Tag color={customer.app_downloaded ? 'green' : 'red'}>{customer.app_downloaded ? 'Yes' : 'No'}</Tag>
            }
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem
            title="Buyer App Activated"
            content={
              <Tag color={customer.buyer_app_activated ? 'green' : 'red'}>
                {customer.buyer_app_activated ? 'Yes' : 'No'}
              </Tag>
            }
          />
        </Col>
      </Row>

      {customer.address && (
        <>
          <Divider />
          <Title level={5} style={{ marginBottom: 16 }}>
            Address
          </Title>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <DescriptionItem title="Street" content={customer.address.street || 'N/A'} />
            </Col>
            <Col span={12}>
              <DescriptionItem title="City" content={customer.address.city || 'N/A'} />
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <DescriptionItem title="State" content={customer.address.state || 'N/A'} />
            </Col>
            <Col span={12}>
              <DescriptionItem title="Country" content={customer.address.country || 'N/A'} />
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <DescriptionItem title="Postal Code" content={customer.address.postal_code || '-'} />
            </Col>
          </Row>
        </>
      )}
    </Flex>
  );
};

export default CustomerDetail;
