import React from 'react';
import { Plugin } from '@nocobase/client';

import { MoiBookingsInitializerItem } from './components/bookings/moi/initializer';
import { MoiBookingsSettings } from './components/bookings/moi/settings';
import { HustlesInitializerItem } from './components/hustles/initializer';
import { OrdersInitializerItem } from './components/orders/initializer';
import { UsersInitializerItem } from './components/users/initializer';
import { HustlesSettings } from './components/hustles/settings';
import { OrdersSettings } from './components/orders/settings';
import { UsersSettings } from './components/users/settings';

const Hustles = React.lazy(() =>
  import('./components/hustles/Hustles').then((module) => ({
    default: module.Hustles,
  })),
);

const Users = React.lazy(() =>
  import('./components/users/Users').then((module) => ({
    default: module.Users,
  })),
);

const Orders = React.lazy(() =>
  import('./components/orders/Orders').then((module) => ({
    default: module.Orders,
  })),
);

const MoiBookings = React.lazy(() =>
  import('./components/bookings/moi').then((module) => ({
    default: module.MoiBookings,
  })),
);

export class PluginSupportClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    console.log(this.app);
    this.app.addComponents({
      Hustles,
      Users,
      Orders,
      MoiBookings,
    });

    this.app.schemaSettingsManager.add(HustlesSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${HustlesInitializerItem.name}`,
      HustlesInitializerItem,
    );

    this.app.schemaSettingsManager.add(UsersSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${UsersInitializerItem.name}`,
      UsersInitializerItem,
    );

    this.app.schemaSettingsManager.add(OrdersSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${OrdersInitializerItem.name}`,
      OrdersInitializerItem,
    );

    this.app.schemaSettingsManager.add(MoiBookingsSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${MoiBookingsInitializerItem.name}`,
      MoiBookingsInitializerItem,
    );

    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginSupportClient;
