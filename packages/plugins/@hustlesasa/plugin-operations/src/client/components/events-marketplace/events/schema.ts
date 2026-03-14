import { ISchema } from '@nocobase/client';

import { EventsMarketplaceEventsSettings } from './settings';
import { BlockName, BlockNameLowercase } from './constant';

export const EventsMarketplaceEventsSchema: ISchema = {
  type: 'void',
  'x-settings': EventsMarketplaceEventsSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
