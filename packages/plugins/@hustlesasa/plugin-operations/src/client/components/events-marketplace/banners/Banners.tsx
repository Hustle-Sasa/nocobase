import React from 'react';
import { DeleteFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAPIClient, useRequest, withDynamicSchemaProps } from '@nocobase/client';
import { Card, Flex, message, Modal, Grid, Button, Skeleton } from 'antd';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';

import { type DataItem } from '../(components)/type';
import { BlockName } from './constant';

const CountrySelector = React.lazy(() => import('../(components)/country-selector'));
const AddEvent = React.lazy(() => import('../(components)/add-events'));
const Details = React.lazy(() => import('../(components)/details'));

export const Banners = withDynamicSchemaProps(
  () => {
    const [messageApi, contextHolder] = message.useMessage();

    // variables
    const screens = Grid.useBreakpoint();
    const cols = screens.xl ? 4 : screens.lg ? 3 : screens.sm ? 2 : 1;

    // states
    const [items, setItems] = React.useState<DataItem['product'][]>([]);
    const [filters, setFilters] = React.useState<{ country?: string }>({ country: 'KE' });
    const [pagination, setPagination] = React.useState({ current: 1, pageSize: 30, total: 0 });
    const [viewItem, setViewItem] = React.useState<DataItem['product'] | null>(null);

    // api
    const api = useAPIClient();
    const { run: updateBanners, loading: updating } = useRequest(
      (event_ids: string[], is_banner: boolean) =>
        api.request({ url: 'operations:emUpdateBanners', method: 'POST', params: { event_ids, is_banner } }),
      {
        manual: true,
        onSuccess() {
          messageApi.success('Banners updated successfully');
          refresh();
        },
        onError(e: any) {
          messageApi.error(e?.message || 'Failed to update banners');
        },
      },
    );

    const { loading, refresh } = useRequest<{ data: { data: DataItem['product'][]; meta: any } }>(
      {
        url: 'operations:emListBanners',
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
          ...filters,
        },
      },
      {
        debounceWait: 300,
        refreshDeps: [pagination.current, pagination.pageSize, filters],
        onSuccess(res) {
          setItems(res?.data?.data || []);
          setPagination((prev) => ({ ...prev, total: res?.meta?.total || 0 }));
        },
        onError() {
          messageApi.error('Failed to fetch banners');
        },
      },
    );

    return (
      <Flex vertical gap={24}>
        {contextHolder}

        <Flex align="center" gap={8}>
          <CountrySelector
            value={filters?.country}
            onChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
          />
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
            Refresh
          </Button>
        </Flex>

        <DragDropProvider onDragEnd={(event) => setItems((items) => move(items, event))}>
          <div
            style={{
              gap: 16,
              margin: 0,
              padding: 0,
              display: 'grid',
              listStyle: 'none',
              gridAutoRows: 'minmax(200px, auto)',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {loading
              ? Array.from({ length: cols }).map((_, i) => (
                  <Card
                    key={i}
                    style={{ width: '100%', height: '100%' }}
                    cover={<div style={{ height: 256, background: '#f0f0f0' }} />}
                  >
                    <Skeleton active title={{ width: '60%' }} paragraph={false} />
                  </Card>
                ))
              : items.map((item, key) => (
                  <Sortable
                    item={item}
                    index={key}
                    key={item.id}
                    onDelete={() => updateBanners([item.id], false)}
                    onView={() => setViewItem(item)}
                  />
                ))}

            <AddEvent
              title="Banner"
              submitting={updating}
              country={filters?.country}
              onSubmit={(selectedIds) => updateBanners(selectedIds, true)}
            >
              {({ proceed }) => (
                <Card
                  hoverable
                  onClick={proceed}
                  style={{ width: '100%', height: '100%' }}
                  bodyStyle={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <PlusOutlined style={{ fontSize: 24, marginBottom: 24 }} />
                    <Card.Meta title="Add Banner" />
                  </div>
                </Card>
              )}
            </AddEvent>
          </div>
        </DragDropProvider>

        {viewItem && (
          <Details
            open={true}
            refresh={refresh}
            onClose={() => setViewItem(null)}
            request={{ product: viewItem } as DataItem}
          >
            {() => null}
          </Details>
        )}
      </Flex>
    );
  },
  { displayName: BlockName },
);

function Sortable({
  item,
  index,
  onDelete,
  onView,
}: {
  index: number;
  item: DataItem['product'];
  onDelete: () => void;
  onView: () => void;
}) {
  const { ref } = useSortable({ id: item.id, index });

  return (
    <Card
      hoverable
      ref={ref}
      onClick={onView}
      actions={[
        <DeleteFilled
          style={{ color: '#ff4d4f' }}
          onClick={(e) => {
            e.stopPropagation();
            Modal.confirm({
              title: 'Remove Banner',
              content: 'Are you sure you want to remove this banner?',
              okText: 'Yes, Remove',
              okButtonProps: { danger: true },
              cancelText: 'No, Cancel',
              onOk: onDelete,
              footer: (_, { OkBtn, CancelBtn }) => (
                <>
                  <CancelBtn />
                  <OkBtn />
                </>
              ),
            });
          }}
        />,
      ]}
      style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
      cover={
        <img
          alt="cover"
          draggable={false}
          src={item.cover.url}
          style={{ height: 256, width: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      }
    >
      <span
        style={{
          top: 8,
          left: 8,
          width: 32,
          height: 32,
          fontSize: 14,
          color: 'white',
          display: 'flex',
          fontWeight: 'bold',
          borderRadius: '50%',
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}
      >
        {index + 1}
      </span>
      <Card.Meta title={item.title} />
    </Card>
  );
}

export default Banners;
