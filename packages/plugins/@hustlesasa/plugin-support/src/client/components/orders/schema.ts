import { ISchema } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';
import { OrdersSettings } from './settings';

export const OrdersSchema: ISchema = {
  type: 'void',
  'x-settings': OrdersSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
