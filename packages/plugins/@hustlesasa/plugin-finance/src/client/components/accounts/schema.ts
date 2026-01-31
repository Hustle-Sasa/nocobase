import { ISchema } from '@nocobase/client';
import { BlockName, BlockNameLowercase } from './constant';
import { AccountManagerSettings } from './settings';

export const AccountManagerSchema: ISchema = {
  type: 'void',
  'x-settings': AccountManagerSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
