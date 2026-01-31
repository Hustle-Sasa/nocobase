import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';

import { useT } from '../../locale';
import { WithdrawalListSchema } from './schema';

export const WithdrawalListInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: BlockNameLowercase,
  icon: 'CreditCardOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(BlockName),
      onClick() {
        insert(WithdrawalListSchema);
      },
    };
  },
};
