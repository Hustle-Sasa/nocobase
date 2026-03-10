import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';

import { BlockNameLowercase, BlockName } from './constant';
import { EventsMarketplaceEventsSchema } from './schema';
import { useT } from '../../../locale';

export const EventsMarketplaceEventsInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: BlockNameLowercase,
  icon: 'UserSwitchOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(BlockName),
      onClick() {
        insert(EventsMarketplaceEventsSchema);
      },
    };
  },
};
