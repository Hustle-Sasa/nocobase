import { ISchema } from '@nocobase/client';
import { BlockName, BlockNameLowercase } from './constant';
import { WithdrawalListSettings } from './settings';

export const WithdrawalListSchema: ISchema = {
  type: 'void',
  'x-settings': WithdrawalListSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
