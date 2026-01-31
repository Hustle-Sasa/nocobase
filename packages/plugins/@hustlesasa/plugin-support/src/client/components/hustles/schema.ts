import { ISchema } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';
import { HustlesSettings } from './settings';

export const HustlesSchema: ISchema = {
  type: 'void',
  'x-settings': HustlesSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
