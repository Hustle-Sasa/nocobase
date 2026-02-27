import React from 'react';
import { Plugin } from '@nocobase/client';

import { TicketAgentsSettings } from './components/ticket-agents/settings';
import { TicketAgentsInitializerItem } from './components/ticket-agents/initializer';
import { EventsMarketplaceRequestsSettings } from './components/events-marketplace/requests/settings';
import { EventsMarketplaceRequestsInitializerItem } from './components/events-marketplace/requests/initializer';
import { EventsMarketplaceBannersSettings } from './components/events-marketplace/banners/settings';
import { EventsMarketplaceBannersInitializerItem } from './components/events-marketplace/banners/initializer';
import { EventsMarketplaceFeaturedSettings } from './components/events-marketplace/featured/settings';
import { EventsMarketplaceFeaturedInitializerItem } from './components/events-marketplace/featured/initializer';

const TicketAgents = React.lazy(() =>
  import('./components/ticket-agents/TicketAgents').then((module) => ({
    default: module.TicketAgents,
  })),
);

const EventsMarketplaceRequests = React.lazy(() =>
  import('./components/events-marketplace/requests/Requests').then((module) => ({
    default: module.Requests,
  })),
);

const EventsMarketplaceBanners = React.lazy(() =>
  import('./components/events-marketplace/banners/Banners').then((module) => ({
    default: module.Banners,
  })),
);

const EventsMarketplaceFeatured = React.lazy(() =>
  import('./components/events-marketplace/featured/Featured').then((module) => ({
    default: module.Featured,
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
      EventsMarketplaceRequests,
      EventsMarketplaceBanners,
      EventsMarketplaceFeatured,
    });

    this.app.schemaSettingsManager.add(TicketAgentsSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${TicketAgentsInitializerItem.name}`,
      TicketAgentsInitializerItem,
    );

    this.app.schemaSettingsManager.add(EventsMarketplaceRequestsSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${EventsMarketplaceRequestsInitializerItem.name}`,
      EventsMarketplaceRequestsInitializerItem,
    );

    this.app.schemaSettingsManager.add(EventsMarketplaceBannersSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${EventsMarketplaceBannersInitializerItem.name}`,
      EventsMarketplaceBannersInitializerItem,
    );

    this.app.schemaSettingsManager.add(EventsMarketplaceFeaturedSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${EventsMarketplaceFeaturedInitializerItem.name}`,
      EventsMarketplaceFeaturedInitializerItem,
    );

    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginOperationsClient;
