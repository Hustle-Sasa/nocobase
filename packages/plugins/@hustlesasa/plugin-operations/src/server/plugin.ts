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
            const response = await fetch(
              `${config.coreApiUrl}/TicketManagers?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
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

        emListProducts: async (ctx, next) => {
          const { page = 0, pageSize = 30, search = '', country, exclude } = ctx.action?.params || {};

          try {
            // Fetch from external API
            const params = new URLSearchParams({
              page: String(page),
              limit: String(pageSize),
            });
            if (search) params.append('search', search);
            if (country) params.append('country', country);
            if (exclude) params.append('exclude', exclude);

            const response = await fetch(`${config.coreApiUrl}/marketplace/products?${params.toString()}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            ctx.body = {
              data: res?.data || [],
              meta: {
                count: res?.meta?.pagination?.total_items || 0,
                total: res?.meta?.pagination?.total_items || 0,
                page,
                pageSize,
                totalPages: res?.meta?.pagination?.total_pages || 0,
              },
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        emRequestList: async (ctx, next) => {
          const { page = 0, pageSize = 30, search = '', status, country } = ctx.action?.params || {};

          try {
            // Fetch from external API
            const params = new URLSearchParams({
              page: String(page),
              limit: String(pageSize),
            });
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (country) params.append('country', country);

            const response = await fetch(
              `${config.coreApiUrl}/marketplace/backoffice/product-approvals?${params.toString()}`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                },
              },
            );

            const res = await response.json();

            ctx.body = {
              data: res?.data || [],
              res,
              meta: {
                count: res?.meta?.pagination?.total_items || 0,
                total: res?.meta?.pagination?.total_items || 0,
                page,
                pageSize,
                totalPages: res?.meta?.pagination?.total_pages || 0,
              },
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }

          await next();
        },
        emRequestApprove: async (ctx, next) => {
          const { request_id } = ctx.action?.params || {};

          try {
            const response = await fetch(
              `${config.coreApiUrl}/marketplace/backoffice/product-approvals/${request_id}`,
              {
                method: 'PATCH',
                body: JSON.stringify({ approved_to_marketplace: true }),
                headers: {
                  Authorization: `Basic ${credentials}`,
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
              },
            );

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
        emRequestReject: async (ctx, next) => {
          const { request_id } = ctx.action?.params || {};

          try {
            const response = await fetch(
              `${config.coreApiUrl}/marketplace/backoffice/product-approvals/${request_id}`,
              {
                method: 'PATCH',
                body: JSON.stringify({ approved_to_marketplace: false }),
                headers: {
                  Authorization: `Basic ${credentials}`,
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
              },
            );

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
        emListBanners: async (ctx, next) => {
          const { page = 0, pageSize = 30, country } = ctx.action?.params || {};

          try {
            const params = new URLSearchParams({
              page: String(page),
              limit: String(pageSize),
            });
            if (country) params.append('country', country);

            const response = await fetch(`${config.coreApiUrl}/marketplace/products/banners?${params.toString()}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            ctx.body = {
              data: res?.data || [],
              meta: {
                count: res?.meta?.pagination?.total_items || 0,
                total: res?.meta?.pagination?.total_items || 0,
                page,
                pageSize,
                totalPages: res?.meta?.pagination?.total_pages || 0,
              },
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        emUpdateBanners: async (ctx, next) => {
          const { event_ids, is_banner } = ctx.action?.params || {};

          try {
            const response = await fetch(`${config.coreApiUrl}/marketplace/backoffice/products/banner`, {
              method: 'POST',
              body: JSON.stringify({ product_ids: event_ids, is_banner: is_banner === 'true' }),
              headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            });

            const res = await response.json();

            if (res.success === true) {
              ctx.body = { message: res.message };
            } else {
              ctx.throw(400, res?.message || 'Failed to update banners');
            }
          } catch (error: any) {
            ctx.throw(500, error?.message);
          }

          await next();
        },

        emListFeatured: async (ctx, next) => {
          const { page = 0, pageSize = 30, country } = ctx.action?.params || {};

          try {
            const params = new URLSearchParams({
              page: String(page),
              limit: String(pageSize),
            });
            if (country) params.append('country', country);

            const response = await fetch(`${config.coreApiUrl}/marketplace/products/featured?${params.toString()}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            ctx.body = {
              data: res?.data || [],
              meta: {
                count: res?.meta?.pagination?.total_items || 0,
                total: res?.meta?.pagination?.total_items || 0,
                page,
                pageSize,
                totalPages: res?.meta?.pagination?.total_pages || 0,
              },
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }

          await next();
        },

        emUpdateFeatured: async (ctx, next) => {
          const { event_ids, is_featured } = ctx.action?.params || {};

          try {
            const response = await fetch(`${config.coreApiUrl}/marketplace/backoffice/products/featured`, {
              method: 'POST',
              body: JSON.stringify({ product_ids: event_ids, is_featured }),
              headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            });

            const res = await response.json();

            if (res.success === true) {
              ctx.body = { message: res.message };
            } else {
              ctx.throw(400, res?.message || 'Failed to update featured events');
            }
          } catch (error: any) {
            ctx.throw(500, error?.message);
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
