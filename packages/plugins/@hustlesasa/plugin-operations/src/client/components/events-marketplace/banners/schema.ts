import { ISchema } from '@nocobase/client';

import { EventsMarketplaceBannersSettings } from './settings';
import { BlockName, BlockNameLowercase } from './constant';

export const EventsMarketplaceBannersSchema: ISchema = {
  type: 'void',
  'x-settings': EventsMarketplaceBannersSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
