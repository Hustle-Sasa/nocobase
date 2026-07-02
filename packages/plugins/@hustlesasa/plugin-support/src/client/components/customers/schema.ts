import { ISchema } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';
import { CustomersSettings } from './settings';

export const CustomersSchema: ISchema = {
  type: 'void',
  'x-settings': CustomersSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
