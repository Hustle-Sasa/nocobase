import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';

import { BlockNameLowercase, BlockName } from './constant';
import { EventsMarketplaceRequestsSchema } from './schema';
import { useT } from '../../../locale';

export const EventsMarketplaceRequestsInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: BlockNameLowercase,
  icon: 'UserSwitchOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(BlockName),
      onClick() {
        insert(EventsMarketplaceRequestsSchema);
      },
    };
  },
};
