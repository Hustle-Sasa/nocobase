import { ISchema } from '@nocobase/client';

import { BlockName, BlockNameLowercase } from './constant';
import { TicketAgentsSettings } from './settings';

export const TicketAgentsSchema: ISchema = {
  type: 'void',
  'x-settings': TicketAgentsSettings.name,
  properties: {
    [BlockNameLowercase]: {
      'x-component': BlockName,
    },
  },
};
