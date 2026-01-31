import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';

import { useT } from '../../../locale';
import { MoiBookingsSchema } from './schema';

export const MoiBookingsInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: BlockNameLowercase,
  icon: 'BookOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(BlockName),
      onClick() {
        insert(MoiBookingsSchema);
      },
    };
  },
};
