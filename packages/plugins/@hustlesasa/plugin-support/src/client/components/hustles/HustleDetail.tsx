import React from 'react';
import { MailOutlined } from '@ant-design/icons';
import { Avatar, Col, Divider, Flex, Image, Row, Skeleton, Tag, Typography } from 'antd';
import { useRequest } from '@nocobase/client';

const { Text, Title, Link } = Typography;

function HustleDetail({ selectedItem }) {
  /**
   * api
   */

  // retrieve env vars
  const { data } = useRequest({
    url: 'client-config:get',
  });
  const { data: response, loading } = useRequest<{ data: [] }>({
    url: `hustles:get/${selectedItem.shop_id}`,
  });

  /**
   * variables
   */
  const hustle = response?.data?.['data'] || [];
  const config = data?.['data'];
  const domain = `https://${hustle.url || ''}${config?.baseDomain}`;

  if (!response && loading) {
    return (
      <Flex vertical gap={16} style={{ paddingTop: 16 }}>
        <Skeleton avatar active paragraph={{ rows: 4 }} />
        <Divider />
        <Skeleton active paragraph={{ rows: 6 }} />
        <Divider />
        <Skeleton active paragraph={{ rows: 4 }} />
      </Flex>
    );
  }

  return (
    <Flex vertical style={{ paddingTop: 16 }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        General Information
      </Title>

      <Flex wrap="wrap" justify="space-between" style={{ marginBottom: 24 }} gap={16}>
        <Flex gap={8}>
          <Avatar size={48} alt="shop logo" src={hustle.logo || ''} />
          <Flex vertical gap={4}>
            <Text>{hustle.title}</Text>
            <a href={`https://${hustle.url || ''}${domain}`} target="_blank">
              {domain}
            </a>
          </Flex>
        </Flex>

        {hustle?.email && (
          <Link href={`mailto:${hustle?.email || ''}`} target="_blank">
            <MailOutlined size={24} /> {hustle?.email}
          </Link>
        )}
      </Flex>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem title="Shop Name" content={hustle?.title || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Account" content={hustle?.account || '-'} />
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem title="Phone" content={hustle?.phone || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Email" content={hustle?.email || '-'} />
        </Col>
      </Row>

      <Row wrap gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem
            title="URL"
            content={
              <a href={domain} target="_blank">
                {domain}
              </a>
            }
          />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Verified" content={hustle?.verified === 1 ? 'Yes' : 'No'} />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem
            title="Online"
            content={
              <Tag color={hustle?.online === 1 ? 'green' : 'red'}>{hustle?.online === 1 ? 'Online' : 'Offline'}</Tag>
            }
          />
        </Col>
        <Col span={12}>
          <DescriptionItem
            title="Status"
            content={
              <Tag color={hustle?.status === 1 ? 'blue' : 'red'}>{hustle?.status === 1 ? 'Approved' : 'Suspended'}</Tag>
            }
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <DescriptionItem title="Description" content={hustle?.description || '-'} />
        </Col>
      </Row>
      <Divider />

      <Title level={5} style={{ marginBottom: 16 }}>
        Shop Info
      </Title>
      <Row>
        <Col span={12}>
          <DescriptionItem title="Location" content={hustle?.location || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Country" content={hustle?.country?.name || '-'} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title="Instagram" content={hustle?.instagram || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Facebook" content={hustle?.facebook || '-'} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title="Youtube" content={hustle?.youtube || '-'} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="TikTok" content={hustle?.tiktok || '-'} />
        </Col>
      </Row>
      {hustle?.banner?.length > 0 && (
        <Row>
          <Col span={24}>
            <DescriptionItem
              title="Banners"
              content={
                <Flex wrap="wrap" gap={16}>
                  {hustle?.banner?.map((b) => (
                    <Image
                      key={b.id}
                      width={100}
                      height={100}
                      src={b?.url || ''}
                      style={{
                        borderRadius: 4,
                        backgroundColor: '#F0F2F5',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  ))}
                </Flex>
              }
            />
          </Col>
        </Row>
      )}
      <Divider />
      <Title level={5} style={{ marginBottom: 16 }}>
        Delivery settings
      </Title>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <DescriptionItem
            title="Hustle delivery"
            content={<Tag color="blue">{hustle?.delivery === 1 ? 'true' : 'false'}</Tag>}
          />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Delivery fee" content={hustle?.delivery_cost || '-'} />
        </Col>
      </Row>
    </Flex>
  );
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

export default HustleDetail;
