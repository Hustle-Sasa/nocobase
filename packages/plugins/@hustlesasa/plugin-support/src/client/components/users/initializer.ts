import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';

import { useT } from '../../locale';
import { UsersSchema } from './schema';

export const UsersInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: BlockNameLowercase,
  icon: 'UserOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(BlockName),
      onClick() {
        insert(UsersSchema);
      },
    };
  },
};
