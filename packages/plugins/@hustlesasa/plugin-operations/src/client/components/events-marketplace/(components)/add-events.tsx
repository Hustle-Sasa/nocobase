import React from 'react';
import { Button, Checkbox, Drawer, Flex, Image, Input, message, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRequest } from '@nocobase/client';

const Details = React.lazy(() => import('./details'));

import { handleFormatDateTime } from '../../../utls/helper';
import { DataItem } from './type';

function AddEvent({
  title,
  exclude,
  children,
  onSubmit,
  country = 'KE',
  env,
  submitting = false,
}: {
  title: string;
  country?: string;
  env?: string;
  submitting?: boolean;
  exclude: 'banners' | 'featured';
  onSubmit: (selectedIds: string[], refresh: () => void) => void;
  children: (props: { proceed: () => void }) => React.ReactNode;
}) {
  // variables
  const paginationDefault = { current: 1, pageSize: 15, total: 0 };

  // states
  const [messageApi, contextHolder] = message.useMessage();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [pagination, setPagination] = React.useState(paginationDefault);

  // api
  const {
    data: response,
    loading,
    refresh,
  } = useRequest<{ data: { data: DataItem['product'][]; meta: any } }>(
    {
      url: 'operations:emListProducts',
      params: {
        env,
        search,
        country,
        exclude,
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    },
    {
      debounceWait: 300,
      refreshDeps: [search, pagination.current, pagination.pageSize, country, env],
      onSuccess({ data }) {
        setPagination((prev) => ({ ...prev, total: data?.meta?.total || 0 }));
      },
      onError() {
        messageApi.error('Failed to fetch events');
      },
    },
  );

  const data = response?.data?.data || [];

  // effect
  React.useEffect(() => {
    if (!open) {
      setSearch('');
      setSelected([]);
      setPagination(paginationDefault);
    }
  }, [open]);

  return (
    <>
      {contextHolder}
      {children({ proceed: () => setOpen(true) })}
      <Drawer
        open={open}
        closable={false}
        placement="right"
        style={{ maxWidth: '100vw' }}
        onClose={() => setOpen(false)}
        width={typeof window !== 'undefined' && window.innerWidth >= 992 ? '50%' : '100%'}
        title={`Add ${title}(s)`}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={submitting}
              disabled={selected.length === 0}
              onClick={() => {
                onSubmit(selected, refresh);
                setOpen(false);
                setSelected([]);
              }}
            >
              Update
            </Button>
          </Space>
        }
      >
        <Flex justify="end" style={{ marginBottom: 24 }}>
          <Input.Search
            allowClear
            value={search}
            enterButton={<SearchOutlined />}
            placeholder="Search by event title"
            style={{ width: '100%', maxWidth: 320 }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Flex>

        <Table
          scroll={{ x: 'max-content' }}
          columns={[
            {
              title: '',
              key: 'action',
              dataIndex: ['id'],
              render: (id) => (
                <Checkbox
                  checked={selected.includes(id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected((prev) => [...prev, id]);
                    } else {
                      setSelected((prev) => prev.filter((item) => item !== id));
                    }
                  }}
                />
              ),
            },
            {
              title: 'Shop Name',
              dataIndex: ['hustle', 'name'],
              key: 'product.hustle.name',
              onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
              onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
            },
            {
              title: 'Event',
              dataIndex: ['title'],
              key: 'product.title',
              onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
              render: (_, { title, cover }) => (
                <>
                  <Image
                    alt={title}
                    width={32}
                    height={32}
                    src={cover?.url ?? ''}
                    style={{ objectFit: 'cover', objectPosition: 'center', borderRadius: 100 }}
                  />
                  <span style={{ marginLeft: 8 }}>{title}</span>
                </>
              ),
            },
            {
              title: 'Start Date / Time',
              dataIndex: ['default_extra_details', 'start_date'],
              key: 'start_date',
              onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
              onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
              render: (_, { default_extra_details: { start_date, start_time } }: DataItem['product']) =>
                handleFormatDateTime(start_date, start_time),
            },
            {
              title: 'End Date / Time',
              dataIndex: ['default_extra_details', 'end_date'],
              key: 'end_date',
              onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
              onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
              render: (_, { default_extra_details: { end_date, end_time } }: DataItem['product']) =>
                handleFormatDateTime(end_date, end_time),
            },
            {
              title: '',
              key: 'view',
              render: (_, record: DataItem['product']) => (
                <Details env={env} request={{ product: record } as DataItem} refresh={() => {}}>
                  {({ proceed }) => (
                    <Button
                      type="link"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        proceed();
                      }}
                    >
                      View Event
                    </Button>
                  )}
                </Details>
              ),
            },
          ]}
          loading={loading}
          dataSource={data}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showPrevNextJumpers: true,
            showQuickJumper: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '30', '50', '100'],
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Drawer>
    </>
  );
}

export default AddEvent;
