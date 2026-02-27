import React from 'react';
import { Button, Descriptions, Drawer, Flex, Image, message, Modal, Space } from 'antd';

import { handleFormatDateTime } from '../../../utls/helper';
import { DataItem } from './type';
import { useAPIClient } from '@nocobase/client';

function Details({
  request,
  children,
  refresh,
}: {
  request: DataItem;
  refresh: () => void;
  children: (props: { proceed: () => void }) => React.ReactNode;
}) {
  // states
  const [open, setOpen] = React.useState(false);
  const [product, setProduct] = React.useState<DataItem['product']>();

  // handlers
  const handlePrice = (price: { [x: string]: number }) => {
    if (!price) return '-';
    const priceEntries = Object.entries(price);
    if (priceEntries.length === 0) return '-';
    return priceEntries.map(([currency, amount]) => `${currency} ${amount}`).join(', ');
  };

  // effect
  React.useEffect(() => {
    if (request) {
      setProduct(request.product);
    }
  }, [request]);

  return (
    product && (
      <>
        {children({ proceed: () => setOpen(true) })}
        <Drawer
          open={open}
          closable={false}
          placement="right"
          title="Event Details"
          style={{ maxWidth: '100vw' }}
          onClose={() => setOpen(false)}
          width={typeof window !== 'undefined' && window.innerWidth >= 992 ? '50%' : '100%'}
          extra={
            <>
              {request.approved_to_marketplace === null && (
                <Space>
                  <Reject onSuccess={refresh} request={request}>
                    {({ proceed }) => (
                      <Button danger type="primary" onClick={proceed}>
                        Reject
                      </Button>
                    )}
                  </Reject>
                  <Approve onSuccess={refresh} request={request}>
                    {({ proceed }) => (
                      <Button block type="primary" onClick={proceed}>
                        Approve
                      </Button>
                    )}
                  </Approve>
                </Space>
              )}
            </>
          }
        >
          <Flex gap={24} vertical>
            <Image
              height={384}
              width="100%"
              src={product.cover.url}
              style={{ objectFit: 'cover', objectPosition: 'center', marginBottom: 24 }}
            />
            <Descriptions
              title={"Shop's Information"}
              layout="vertical"
              items={[
                { key: '1', label: 'Shop ID', children: product.hustle.id },
                { key: '2', label: 'Shop Name', children: product.hustle.name },
              ]}
            />

            <Descriptions
              title={"Event's Information"}
              layout="vertical"
              items={[
                { key: '1', label: 'Event Title', children: product.title },
                { key: '2', label: 'Event Description', children: product.description },
                { key: '3', label: 'Event Category', children: product?.category?.name || '-' },
                { key: '4', label: 'Event Venue', children: product.default_extra_details.venue },
                { key: '5', label: 'Event Country', children: product.country },
                {
                  key: '6',
                  label: 'Event Start Date & Time',
                  children: handleFormatDateTime(
                    product.default_extra_details.start_date,
                    product.default_extra_details.start_time,
                  ),
                },
                {
                  key: '7',
                  label: 'Event End Date & Time',
                  children: handleFormatDateTime(
                    product.default_extra_details.end_date,
                    product.default_extra_details.end_time,
                  ),
                },
              ]}
            />
            <div>
              <Descriptions title={'Variants Information'} />

              {product.variants.map((variant, index) => (
                <Descriptions
                  key={index}
                  style={{ marginBottom: 16 }}
                  layout="vertical"
                  items={[
                    { key: '0', label: 'Variant Title', children: variant.title },
                    { key: '1', label: 'Description', children: variant.description },
                    { key: '2', label: 'Actual Price', children: handlePrice(variant.actual_price) },
                    { key: '3', label: 'Sale Price', children: handlePrice(variant.selling_price) },
                    { key: '4', label: 'Stock', children: variant.stock },
                  ]}
                />
              ))}
            </div>
          </Flex>
        </Drawer>
      </>
    )
  );
}

function Approve({
  request,
  children,
  onSuccess,
}: {
  request: DataItem;
  onSuccess: () => void;
  children: (props: { proceed: () => void }) => React.ReactNode;
}) {
  // api
  const api = useAPIClient();

  // handler
  const handleApprove = () =>
    Modal.confirm({
      title: 'Approve Event for Marketplace',
      content: 'Are you sure you want to approve this event for the marketplace?',
      async onOk() {
        try {
          await api.request({
            url: 'operations:emRequestApprove',
            method: 'POST',
            params: {
              product_id: request.product.id,
              request_id: request.id,
            },
          });
          message.success('Event approved for marketplace');
          onSuccess();
        } catch (error) {
          message.error('Failed to approve event, try again!');
        }
      },
      okText: 'Yes, Approve',
      cancelText: 'No, Cancel',
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    });

  return <>{children({ proceed: handleApprove })}</>;
}

function Reject({
  request,
  children,
  onSuccess,
}: {
  request: DataItem;
  children: (props: { proceed: () => void }) => React.ReactNode;
  onSuccess: () => void;
}) {
  const api = useAPIClient();

  // handler
  const handleReject = () =>
    Modal.confirm({
      title: 'Reject Event for Marketplace',
      content: 'Are you sure you want to reject this event for the marketplace?',
      async onOk() {
        try {
          await api.request({
            url: 'operations:emRequestReject',
            method: 'POST',
            params: {
              product_id: request.product.id,
              request_id: request.id,
            },
          });
          message.success('Event rejected for marketplace');
          onSuccess();
        } catch (error) {
          message.error('Failed to reject event, try again!');
        }
      },
      okText: 'Yes, Reject',
      cancelText: 'No, Cancel',
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    });

  return <>{children({ proceed: handleReject })}</>;
}

export default Details;

// Shop name
// Shop ID
// Shop link
// Product Title
// Product Description
// Product Category
// Product type (single or group)
// Product Regular Price
// Product Sale Price
// Status (Active/Inactive)
// Product Image
// Event start date
// Event end date
// Event start time
// Event end time
// Inventory (stock quantity)
// Event category
// Ticket Option (variations)
// Venue
// Date product was requested
// Country
