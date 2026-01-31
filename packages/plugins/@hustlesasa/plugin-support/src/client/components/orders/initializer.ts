import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';
import { OrdersSchema } from './schema';
import { useT } from '../../locale';

export const OrdersInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: BlockNameLowercase,
  icon: 'FileOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(BlockName),
      onClick() {
        insert(OrdersSchema);
      },
    };
  },
};
