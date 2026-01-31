import React from 'react';
import { Plugin } from '@nocobase/client';

import { TicketAgentsSettings } from './components/ticket-agents/settings';
import { TicketAgentsInitializerItem } from './components/ticket-agents/initializer';

const TicketAgents = React.lazy(() =>
  import('./components/ticket-agents/TicketAgents').then((module) => ({
    default: module.TicketAgents,
  })),
);

export class PluginOperationsClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    console.log(this.app);
    this.app.addComponents({
      TicketAgents,
    });

    this.app.schemaSettingsManager.add(TicketAgentsSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${TicketAgentsInitializerItem.name}`,
      TicketAgentsInitializerItem,
    );

    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginOperationsClient;
