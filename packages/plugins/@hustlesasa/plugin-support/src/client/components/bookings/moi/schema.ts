import { ISchema } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';
import { MoiBookingsSettings } from './settings';

export const MoiBookingsSchema: ISchema = {
  type: 'void',
  'x-settings': MoiBookingsSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
