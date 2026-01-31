import { ISchema } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';
import { UsersSettings } from './settings';

export const UsersSchema: ISchema = {
  type: 'void',
  'x-settings': UsersSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
