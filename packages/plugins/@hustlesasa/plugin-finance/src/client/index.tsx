import React from 'react';
import { Plugin } from '@nocobase/client';

import { WithdrawalListInitializerItem } from './components/withdrawals/initializer';
import { AccountManagerInitializerItem } from './components/accounts/initializer';
import { WithdrawalListSettings } from './components/withdrawals/settings';
import { AccountManagerSettings } from './components/accounts/settings';

const Withdrawals = React.lazy(() =>
  import('./components/withdrawals/WithdrawalList').then((module) => ({
    default: module.WithdrawalList,
  })),
);

const AccountManager = React.lazy(() =>
  import('./components/accounts/AccountManager').then((module) => ({
    default: module.AccountManager,
  })),
);

export class PluginFinanceClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    console.log(this.app);

    this.app.addComponents({
      Withdrawals,
      AccountManager,
    });

    // this.app.addScopes({});

    this.app.schemaSettingsManager.add(WithdrawalListSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${WithdrawalListInitializerItem.name}`,
      WithdrawalListInitializerItem,
    );

    this.app.schemaSettingsManager.add(AccountManagerSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${AccountManagerInitializerItem.name}`,
      AccountManagerInitializerItem,
    );

    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginFinanceClient;
