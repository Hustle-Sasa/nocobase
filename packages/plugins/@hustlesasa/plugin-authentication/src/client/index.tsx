import { Plugin } from '@nocobase/client';

import AuthLayout from './AuthLayout';

export class PluginAuthenticationClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.app.addComponents({ AuthLayout });
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    this.app.router.add('auth', {
      Component: AuthLayout,
    });
  }
}

export default PluginAuthenticationClient;
