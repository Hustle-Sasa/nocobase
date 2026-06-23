import React from 'react';
import { Button, Descriptions, Drawer, Flex, Form, Image, message, Modal, Select, Space, Tag } from 'antd';
import { useAPIClient } from '@nocobase/client';

import { handleFormatDateTime } from '../../../utls/helper';
import { DataItem } from './type';

function Details({
  request,
  children,
  refresh,
  env,
  open: controlledOpen,
  onClose: controlledOnClose,
}: {
  request: DataItem;
  refresh: () => void;
  env?: string;
  open?: boolean;
  onClose?: () => void;
  children: (props: { proceed: () => void }) => React.ReactNode;
}) {
  // states
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [product, setProduct] = React.useState<DataItem['product']>();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const handleClose = () => (isControlled ? controlledOnClose?.() : setInternalOpen(false));

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
        {children({ proceed: () => setInternalOpen(true) })}
        <Drawer
          open={open}
          closable={false}
          placement="right"
          title="Event Details"
          style={{ maxWidth: '100vw' }}
          onClose={handleClose}
          width={typeof window !== 'undefined' && window.innerWidth >= 992 ? '50%' : '100%'}
          extra={
            <Space>
              {request.approved_to_marketplace === null && (
                <>
                  <Reject env={env} onSuccess={refresh} request={request}>
                    {({ proceed }) => (
                      <Button danger type="primary" onClick={proceed}>
                        Reject
                      </Button>
                    )}
                  </Reject>
                  <Approve env={env} onSuccess={refresh} request={request}>
                    {({ proceed }) => (
                      <Button block type="primary" onClick={proceed}>
                        Approve
                      </Button>
                    )}
                  </Approve>
                </>
              )}
              {request.approved_to_marketplace !== null && (
                <>
                  {request.approved_to_marketplace ? (
                    <Tag color="success">Approved</Tag>
                  ) : (
                    <Tag color="error">Rejected</Tag>
                  )}
                </>
              )}
              <Remove
                env={env}
                onSuccess={() => {
                  refresh();
                  handleClose();
                }}
                request={request}
              >
                {({ proceed }) => (
                  <Button danger onClick={proceed}>
                    Remove from marketplace
                  </Button>
                )}
              </Remove>
            </Space>
          }
        >
          <Flex gap={24} vertical>
            <Image
              height={384}
              width="100%"
              src={`${product.cover.cdn_url || product.cover.url}?w=384&h=384&fit=max`}
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
                {
                  key: '3',
                  label: 'Event Category',
                  children: product?.marketplace_categories?.map((i) => i.title)?.join(', ') || '-',
                },
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
                  style={{ marginBottom: 24 }}
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
  env,
}: {
  request: DataItem;
  onSuccess: () => void;
  env?: string;
  children: (props: { proceed: () => void }) => React.ReactNode;
}) {
  const api = useAPIClient();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState<{ id: string; title: string; slug: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (!open) return;

    setCategoriesLoading(true);
    api
      .request({
        url: 'operations:emListCategories',
        params: { env, country: request.product.country },
      })
      .then((res: any) => {
        setCategories(res?.data?.data || []);
      })
      .finally(() => setCategoriesLoading(false));

    form.setFieldsValue({
      marketplace_categories: (request?.product?.marketplace_categories || []).map((c) => c.id),
    });
  }, [open]);

  const handleSubmit = async () => {
    let values: any;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSubmitting(true);
    try {
      await api.request({
        url: 'operations:emRequestApprove',
        method: 'POST',
        params: { product_id: request.product.id, request_id: request.id, env },
        data: { categories: values.marketplace_categories },
      });
      message.success('Event approved for marketplace');
      setOpen(false);
      onSuccess();
    } catch {
      message.error('Failed to approve event, try again!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {children({ proceed: () => setOpen(true) })}
      <Modal
        open={open}
        title="Approve Event for Marketplace"
        okText="Yes, Approve"
        cancelText="No, Cancel"
        onCancel={() => setOpen(false)}
        confirmLoading={submitting}
        onOk={handleSubmit}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="marketplace_categories"
            label="Marketplace Categories"
            rules={[
              { required: true, message: 'Please select at least 1 category' },
              {
                validator: (_, value) =>
                  !value || value.length <= 3
                    ? Promise.resolve()
                    : Promise.reject(new Error('You can select at most 3 categories')),
              },
            ]}
          >
            <Select
              mode="multiple"
              loading={categoriesLoading}
              placeholder="Select categories"
              options={categories?.map((c) => ({ label: c.title, value: c.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function Reject({
  request,
  children,
  onSuccess,
  env,
}: {
  request: DataItem;
  children: (props: { proceed: () => void }) => React.ReactNode;
  onSuccess: () => void;
  env?: string;
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
              env,
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

function Remove({
  request,
  children,
  onSuccess,
  env,
}: {
  request: DataItem;
  children: (props: { proceed: () => void }) => React.ReactNode;
  onSuccess: () => void;
  env?: string;
}) {
  const api = useAPIClient();

  const handleRemove = () =>
    Modal.confirm({
      title: 'Remove Event from Marketplace',
      content: 'Are you sure you want to remove this event from the marketplace?',
      async onOk() {
        try {
          await api.request({
            url: 'operations:emRemoveProduct',
            method: 'POST',
            params: {
              product_id: request.product.id,
              env,
            },
          });
          message.success('Event removed from marketplace');
          onSuccess();
        } catch (error) {
          message.error('Failed to remove event, try again!');
        }
      },
      okText: 'Yes, Remove',
      cancelText: 'No, Cancel',
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    });

  return <>{children({ proceed: handleRemove })}</>;
}

export default Details;
