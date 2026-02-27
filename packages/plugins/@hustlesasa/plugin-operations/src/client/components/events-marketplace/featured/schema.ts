import { ISchema } from '@nocobase/client';

import { EventsMarketplaceFeaturedSettings } from './settings';
import { BlockName, BlockNameLowercase } from './constant';

export const EventsMarketplaceFeaturedSchema: ISchema = {
  type: 'void',
  'x-settings': EventsMarketplaceFeaturedSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
