import React from 'react';
import { Card, Flex, message, Grid, Drawer, Space, Button, Input, Table, Select, Image, Checkbox } from 'antd';
import { DeleteFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { withDynamicSchemaProps } from '@nocobase/client';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';

import { dummyDataItems, type DataItem } from './type';
import { BlockName } from './constant';
import { handleFormatDateTime } from '../../../utls/helper';

export const Banners = withDynamicSchemaProps(
  () => {
    const [messageApi, contextHolder] = message.useMessage();

    // variables
    const screens = Grid.useBreakpoint();
    const cols = screens.xl ? 4 : screens.lg ? 3 : screens.sm ? 2 : 1;

    // states
    const [items, setItems] = React.useState<DataItem[]>(dummyDataItems);
    const [filters, setFilters] = React.useState<{ country?: string }>({});

    return (
      <Flex vertical gap={24}>
        {contextHolder}
        <Select
          allowClear
          style={{ width: 300 }}
          value={filters?.country}
          placeholder="Filter by country"
          onChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
        >
          {[
            { value: 'GH', label: 'Ghana' },
            { value: 'NG', label: 'Nigeria' },
            { value: 'KE', label: 'Kenya' },
          ].map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>

        <DragDropProvider onDragEnd={(event) => setItems((items) => move(items, event))}>
          <div
            style={{
              gap: 16,
              margin: 0,
              padding: 0,
              display: 'grid',
              listStyle: 'none',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {items.map((item, key) => (
              <Sortable key={item.id} item={item} index={key} />
            ))}

            <AddBanner>
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
            </AddBanner>
          </div>
        </DragDropProvider>
      </Flex>
    );
  },
  { displayName: BlockName },
);

function Sortable({ item, index }: { item: DataItem; index: number }) {
  const { ref } = useSortable({ id: item.id, index });

  return (
    <Card
      hoverable
      ref={ref}
      actions={[<DeleteFilled />]}
      style={{ width: '100%', height: '100%' }}
      cover={
        <img
          alt="cover"
          draggable={false}
          src={item.cover.url}
          style={{ height: 256, width: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      }
    >
      <Card.Meta title={item.title} />
    </Card>
  );
}

function AddBanner({ children }: { children: (props: { proceed: () => void }) => React.ReactNode }) {
  // states
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });

  return (
    <>
      {children({ proceed: () => setOpen(true) })}
      <Drawer
        open={open}
        closable={false}
        placement="right"
        style={{ maxWidth: '100vw' }}
        onClose={() => setOpen(false)}
        width={typeof window !== 'undefined' && window.innerWidth >= 992 ? '50%' : '100%'}
        title="Add Banner(s)"
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => {
                setOpen(false);
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
          columns={[
            {
              title: '',
              key: 'action',
              dataIndex: 'id',
              render: (id) => {
                return (
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
                );
              },
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
              render: (_, { default_extra_details: { end_date, end_time } }) =>
                handleFormatDateTime(end_date, end_time),
            },
          ]}
          dataSource={dummyDataItems}
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
      </Drawer>
    </>
  );
}

export default Banners;
