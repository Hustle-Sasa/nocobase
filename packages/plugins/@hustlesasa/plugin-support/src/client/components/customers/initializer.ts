import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';

import { useT } from '../../locale';
import { CustomersSchema } from './schema';

export const CustomersInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: BlockNameLowercase,
  icon: 'TeamOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(BlockName),
      onClick() {
        insert(CustomersSchema);
      },
    };
  },
};
