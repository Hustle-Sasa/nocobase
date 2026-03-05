import React from 'react';
import { Button, Flex, Image, Input, message, Table, TableColumnsType } from 'antd';
import { DeleteFilled, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useAPIClient, useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';

import { handleFormatDateTime } from '../../../utls/helper';
import { type DataItem } from '../(components)/type';
import { BlockName } from './constant';
import CountrySelector from '../(components)/country-selector';

const AddEvent = React.lazy(() => import('../(components)/add-events'));
const Details = React.lazy(() => import('../(components)/details'));

export const Featured = withDynamicSchemaProps(
  () => {
    const [messageApi, contextHolder] = message.useMessage();

    // states
    const [search, setSearch] = React.useState('');
    const [filters, setFilters] = React.useState<{ status?: string; country?: string }>({ country: 'KE' });
    const [pagination, setPagination] = React.useState({ current: 1, pageSize: 30, total: 0 });
    const [items, setItems] = React.useState<DataItem['product'][]>([]);
    const [viewItem, setViewItem] = React.useState<DataItem | null>(null);

    // api
    const api = useAPIClient();
    const { run: updateFeatured, loading: updating } = useRequest(
      (event_ids: string[], is_featured: boolean) =>
        api.request({ url: 'operations:emUpdateFeatured', method: 'POST', params: { event_ids, is_featured } }),
      {
        manual: true,
        onSuccess() {
          messageApi.success('Featured events updated successfully');
          refresh();
        },
        onError(e: any) {
          messageApi.error(e?.message || 'Failed to update featured events');
        },
      },
    );

    const {
      data: response,
      loading,
      refresh,
    } = useRequest<{ data: { data: DataItem['product'][]; meta: any } }>(
      {
        url: 'operations:emListFeatured',
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          ...filters,
        },
      },
      {
        debounceWait: 300,
        refreshDeps: [search, pagination.current, pagination.pageSize, filters],
        onSuccess(res) {
          setItems(res?.data?.data || []);
          setPagination((prev) => ({ ...prev, total: res?.meta?.total || 0 }));
        },
        onError() {
          messageApi.error('Failed to fetch requests');
        },
      },
    );

    // handlers
    const handleStatus = (approvedToMarketplace: boolean | null): { text: string; color: string } => {
      if (approvedToMarketplace === null) {
        return { text: 'Pending', color: 'orange' };
      }
      return approvedToMarketplace ? { text: 'Approved', color: 'green' } : { text: 'Rejected', color: 'red' };
    };

    const handleSearch = () => {
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
      refresh();
    };

    // variables
    const colums: TableColumnsType<DataItem['product']> = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Shop Name',
        dataIndex: ['hustle', 'name'],
        key: 'hustle.name',
      },
      {
        title: 'Event',
        dataIndex: 'title',
        key: 'title',
        render: (_, { title, cover }) => {
          return (
            <>
              <Image
                src={cover.url}
                alt={title}
                width={32}
                height={32}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: 100,
                }}
              />
              <span style={{ marginLeft: 8 }}>{title}</span>
            </>
          );
        },
      },
      {
        title: 'Category',
        dataIndex: ['category', 'name'],
        key: 'category.name',
      },
      {
        title: 'Country',
        dataIndex: 'country',
        key: 'country',
      },
      {
        title: 'Start Date / Time',
        dataIndex: ['default_extra_details', 'start_date'],
        key: 'start_date',
        render: (_, { default_extra_details: { start_date, start_time } }) =>
          handleFormatDateTime(start_date, start_time),
      },
      {
        title: 'End Date / Time',
        dataIndex: ['default_extra_details', 'end_date'],
        key: 'end_date',
        render: (_, { default_extra_details: { end_date, end_time } }) => handleFormatDateTime(end_date, end_time),
      },
      {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => {
          return (
            <>
              <Details request={{ product: record } as DataItem} refresh={refresh}>
                {({ proceed }) => (
                  <Button color="primary" type="link" style={{ color: '#00cc99' }} onClick={proceed}>
                    View Event
                  </Button>
                )}
              </Details>
              <Button
                type="link"
                color="danger"
                icon={<DeleteFilled />}
                onClick={() => updateFeatured([record.id], false)}
              />
            </>
          );
        },
      },
    ];

    return (
      <div style={{ padding: 24 }}>
        {contextHolder}

        <Flex style={{ marginBottom: 16 }} gap={6} justify="space-between" align="center">
          <Flex align="center" gap={6}>
            <CountrySelector
              value={filters?.country}
              onChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
            />
          </Flex>

          <Flex align="center" justify="flex" gap={8}>
            <Input.Search
              allowClear
              value={search}
              onSearch={handleSearch}
              style={{ width: '300px' }}
              enterButton={<SearchOutlined />}
              placeholder="Search by product title"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
              Refresh
            </Button>
            <AddEvent
              title="Featured Event"
              country={filters?.country}
              submitting={updating}
              onSubmit={(selectedIds) => updateFeatured(selectedIds, true)}
            >
              {({ proceed }) => (
                <Button color="primary" onClick={proceed}>
                  Add Events
                </Button>
              )}
            </AddEvent>
          </Flex>
        </Flex>

        <DragDropProvider onDragEnd={(event) => setItems((data) => move(data, event))}>
          <Table
            rowKey="id"
            columns={colums}
            loading={loading}
            dataSource={items}
            components={{ body: { row: SortableRow } }}
            onRow={(record, index) => ({
              index,
              style: { cursor: 'pointer' },
              onClick: () => setViewItem({ id: record.id, status: 'approved', approved_to_marketplace: true, product: record }),
            } as React.HTMLAttributes<HTMLElement>)}
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
                setPagination((prev) => ({
                  ...prev,
                  current: page,
                  pageSize,
                }));
              },
            }}
          />
        </DragDropProvider>

        {viewItem && (
          <Details
            request={viewItem}
            refresh={refresh}
            open={true}
            onClose={() => setViewItem(null)}
          >
            {() => null}
          </Details>
        )}
      </div>
    );
  },
  { displayName: BlockName },
);

function SortableRow({ index, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { index?: number }) {
  const id = (props as any)['data-row-key'];
  const { ref } = useSortable({ id, index: index ?? 0 });
  return <tr ref={ref} {...props} />;
}
