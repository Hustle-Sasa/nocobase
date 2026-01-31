import { Plugin } from '@nocobase/server';

export class PluginFinanceServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    const username = process.env.EXTERNAL_API_USERNAME;
    const password = process.env.EXTERNAL_API_PASSWORD;
    const credentials = btoa(`${username}:${password}`);

    const config = {
      coreApiUrl: process.env.EXTERNAL_CORE_API_URL,
      servicesApiUrl: process.env.EXTERNAL_SERVICES_API_URL,
    };

    this.app.resourceManager.define({
      name: 'finance',

      actions: {
        list: async (ctx: any, next) => {
          const { page = 1, pageSize = 20 } = ctx.action.params;

          try {
            // Fetch from external API
            const response = await fetch(`${config.coreApiUrl}/payouts?limit=${pageSize}&page=${page}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (!res?.transactions || !Array.isArray(res?.transactions)) {
              ctx.body = {
                data: [],
                meta: {
                  count: 0,
                  total: 0,
                  page,
                  pageSize,
                  totalPages: 0,
                },
              };
              return await next();
            }

            // Transform data with pagination

            ctx.body = {
              data: res.transactions,
              meta: {
                count: res.total,
                total: res.total,
                page,
                pageSize: pageSize,
                totalPages: Math.ceil(res.total / pageSize),
              },
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }
          await next();
        },

        approve: async (ctx, next) => {
          const { payment_ref = '', reason = '' } = ctx.action.params;
          try {
            const response = await fetch(`${config.coreApiUrl}/payout/verify/${payment_ref}?payment_ref=${reason}`, {
              method: 'POST',
              body: JSON.stringify({}),
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (res.success === false) {
              ctx.throw(404, res?.message);
            } else {
              ctx.body = {
                message: res.message,
              };
            }
          } catch (error: any) {
            ctx.throw(404, error?.message || 'Not found');
          }
          await next();
        },

        // for account manager

        // Get single shop details
        get: async (ctx: any, next) => {
          try {
            const { id = '' } = ctx.action.params;

            if (!id) {
              ctx.throw(400, 'ID is required');
            }

            const response = await fetch(`${config.coreApiUrl}/account/hustle/${id}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (!res?.hustle) {
              ctx.throw(404, 'Hustle not found');
            }

            const data = res?.hustle;

            ctx.body = { data };
          } catch (error: any) {
            console.log({ error });

            ctx.throw(404, 'Not found');
          }

          await next();
        },

        // Get single shop wallet details
        getWallet: async (ctx: any, next) => {
          try {
            const { account = '' } = ctx.action.params;

            if (!account) {
              ctx.throw(400, 'Account is required');
            }

            const response = await fetch(`${config.coreApiUrl}/acc/${account}/balance`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (res.success === false) {
              ctx.throw(404, res?.message);
            } else {
              ctx.body = {
                avl_balance: res?.['avl balance'],
                total_sales: res?.['total sales'],
              };
            }
          } catch (error: any) {
            console.log({ error });

            ctx.throw(404, 'Not found');
          }

          await next();
        },

        listPayouts: async (ctx: any, next) => {
          const { account = '', page = '', pageSize = '' } = ctx.action.params;

          try {
            // Fetch from external API
            const response = await fetch(
              `${config.coreApiUrl}/acc/${account}/transactions/payout?limit=${pageSize}&page=${page}`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                },
              },
            );

            const res = await response.json();

            if (!res?.transaction || !Array.isArray(res?.transaction)) {
              ctx.body = {
                data: [],
              };
              return await next();
            }

            // Transform data with pagination

            ctx.body = {
              data: res.transaction,
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }
          await next();
        },

        debit: async (ctx, next) => {
          const user = ctx.state.currentUser;
          const { hustle = '', amount = 0, payment_ref = '', reason = '' } = ctx.action.params;

          try {
            const response = await fetch(`${config.coreApiUrl}/trans/chargeAccount/debit`, {
              method: 'POST',
              body: JSON.stringify({ hustle, amount, reason, payment_ref, user: user.email }),
              headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            });

            const res = await response.json();

            if (res.success === true) {
              ctx.body = {
                message: 'Amount has been successfully debited',
              };
            } else {
              ctx.throw(404, res?.message || 'Not found');
            }
          } catch (error: any) {
            ctx.throw(404, error?.message);
          }
          await next();
        },

        credit: async (ctx, next) => {
          const user = ctx.state.currentUser;
          const { hustle = '', amount = '', payment_ref = '', reason = '' } = ctx.action.params;

          try {
            const response = await fetch(`${config.coreApiUrl}/trans/chargeAccount/credit`, {
              method: 'POST',
              body: JSON.stringify({ hustle, amount, reason, payment_ref, user }),
              headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            });

            const res = await response.json();

            if (res.success === true) {
              ctx.body = {
                message: 'Amount has been successfully credited',
              };
            } else {
              ctx.throw(404, res?.message || 'Not found');
            }
          } catch (error: any) {
            ctx.throw(404, error?.message);
          }
          await next();
        },
      },
    });

    this.app.acl.allow('finance', '*', 'loggedIn');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginFinanceServer;
