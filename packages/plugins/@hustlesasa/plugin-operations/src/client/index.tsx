import React from 'react';
import { Plugin } from '@nocobase/client';

import { TicketAgentsSettings } from './components/ticket-agents/settings';
import { TicketAgentsInitializerItem } from './components/ticket-agents/initializer';
import { EventsMarketplaceEventsSettings } from './components/events-marketplace/events/settings';
import { EventsMarketplaceEventsInitializerItem } from './components/events-marketplace/events/initializer';
import { EventsMarketplaceBannersSettings } from './components/events-marketplace/banners/settings';
import { EventsMarketplaceBannersInitializerItem } from './components/events-marketplace/banners/initializer';
import { EventsMarketplaceFeaturedSettings } from './components/events-marketplace/featured/settings';
import { EventsMarketplaceFeaturedInitializerItem } from './components/events-marketplace/featured/initializer';

const TicketAgents = React.lazy(() =>
  import('./components/ticket-agents/TicketAgents').then((module) => ({
    default: module.TicketAgents,
  })),
);

const EventsMarketplaceEvents = React.lazy(() =>
  import('./components/events-marketplace/events/Events').then((module) => ({
    default: module.Events,
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
    this.app.addComponents({
      TicketAgents,
      EventsMarketplaceEvents,
      EventsMarketplaceBanners,
      EventsMarketplaceFeatured,
    });

    this.app.schemaSettingsManager.add(TicketAgentsSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${TicketAgentsInitializerItem.name}`,
      TicketAgentsInitializerItem,
    );

    this.app.schemaSettingsManager.add(EventsMarketplaceEventsSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${EventsMarketplaceEventsInitializerItem.name}`,
      EventsMarketplaceEventsInitializerItem,
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
