import { SchemaSettings } from '@nocobase/client';

import { BlockNameLowercase } from './constant';

export const EventsMarketplaceFeaturedSettings = new SchemaSettings({
  name: `blockSettings:${BlockNameLowercase}`,
  items: [
    {
      type: 'remove',
      name: 'remove',
      componentProps: {
        removeParentsIfNoChildren: true,
        breakRemoveOn: {
          'x-component': 'Grid',
        },
      },
    },
  ],
});
