import { ISchema } from '@nocobase/client';

import { EventsMarketplaceRequestsSettings } from './settings';
import { BlockName, BlockNameLowercase } from './constant';

export const EventsMarketplaceRequestsSchema: ISchema = {
  type: 'void',
  'x-settings': EventsMarketplaceRequestsSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
