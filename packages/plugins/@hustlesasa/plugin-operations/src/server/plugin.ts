import { Plugin } from '@nocobase/server';

export class PluginOperationsServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    const username = process.env.EXTERNAL_API_USERNAME;
    const password = process.env.EXTERNAL_API_PASSWORD;
    const credentials = btoa(`${username}:${password}`);

    const config = {
      coreApiUrl: process.env.EXTERNAL_CORE_API_URL,
      servicesApiUrl: process.env.EXTERNAL_SERVICES_API_URL,
      baseDomain: process.env.EXTERNAL_HUSTLESASA_BASE_DOMAIN,
    };

    this.app.resourceManager.define({
      name: 'operations',

      actions: {
        list: async (ctx, next) => {
          const { page = 0, limit = 30, search = '' } = ctx.action.params;

          try {
            // Fetch from external API
            const searchParam = search ? `&search=${search}` : '';
            const response = await fetch(
              `${config.coreApiUrl}/TicketManagers?page=${page}&limit=${limit}${searchParam}`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                },
              },
            );

            let res = await response.json();

            // Ensure hustles exists and is an array
            if (!res?.hustles || !Array.isArray(res.hustles)) {
              ctx.body = {
                data: [],
                meta: {
                  count: 0,
                  total: 0,
                  page,
                  pageSize: parseInt(limit),
                  totalPages: 0,
                },
              };
              return await next();
            }

            // Transform data with pagination

            ctx.body = {
              data: res.hustles,
              meta: {
                count: res.total,
                total: res.total,
                page,
                pageSize: parseInt(limit),
                totalPages: Math.ceil(res.total / limit),
              },
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        delete: async (ctx, next) => {
          const user_id = ctx.action.params.filterByTk || ctx.params.id;
          try {
            const response = await fetch(`${config.coreApiUrl}/profile/${user_id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (res.success === false) {
              ctx.throw(404, res?.message);
            } else {
              return;
            }
          } catch (error: any) {
            ctx.throw(404, error?.message || 'Not found');
          }

          await next();
        },

        assign: async (ctx, next) => {
          const { phone = '', account = '' } = ctx.action.params;

          try {
            const response = await fetch(`${config.coreApiUrl}/addAgents`, {
              method: 'POST',
              body: JSON.stringify({ phone, account }),
              headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            });

            const res = await response.json();

            if (res.success === true) {
              ctx.body = {
                message: res.message,
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

    this.app.acl.allow('operations', '*', 'loggedIn');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginOperationsServer;
