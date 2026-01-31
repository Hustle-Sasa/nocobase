import { Plugin } from '@nocobase/server';

export class PluginSupportServer extends Plugin {
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

    // for users

    this.app.resourceManager.define({
      name: 'user',

      actions: {
        list: async (ctx, next) => {
          const { page = 0, pageSize = 30, user_id = '', user_phone_number = '', user_email = '' } = ctx.action.params;

          try {
            const response = await fetch(
              `${config.coreApiUrl}/getAllUsers?page=${page}&limit=${pageSize}${user_id ? `&user_id=${user_id}` : ''}${user_phone_number ? `&user_phone_number=${user_phone_number}` : ''}${user_email ? `&user_email=${user_email}` : ''}`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                },
              },
            );

            const res = await response.json();

            if (!res?.profiles || !Array.isArray(res?.profiles)) {
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
              data: res.profiles,
              meta: {
                count: res.total,
                total: res.total,
                page,
                pageSize: pageSize,
                totalPages: Math.ceil(res.total / pageSize),
              },
            };
          } catch (error) {
            ctx.throw(500, error.message);
          }

          await next();
        },
      },
    });

    // for orders
    this.app.resourceManager.define({
      name: 'orders',
      actions: {
        // List action - get all items

        list: async (ctx: any, next) => {
          const { page = 1, limit = 30, search = '', status = '', id = '' } = ctx.action.params;

          try {
            // Decide endpoint based on whether we are filtering by a specific order id
            const requestUrl = id
              ? `${config.servicesApiUrl}/orders/back-office/${id}`
              : `${config.servicesApiUrl}/orders/back-office?limit=${limit}&page=${page}${
                  search ? `&search=${search}` : ''
                }${status ? `&status=${status}` : ''}`;

            const response = await fetch(requestUrl, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });
            let res = await response.json();

            // Ensure hustles exists and is an array
            if (!res?.data) {
              ctx.body = {
                data: [],
                meta: {
                  count: 0,
                  total: 0,
                  page: parseInt(page),
                  pageSize: parseInt(limit),
                  totalPages: 0,
                },
              };
              return await next();
            }

            if (id) {
              ctx.body = {
                data: Array.isArray(res.data) ? res.data : [res.data],
                meta: {
                  count: Array.isArray(res.data) ? res.data.length : 1,
                  total: Array.isArray(res.data) ? res.data.length : 1,
                  page: 1,
                  pageSize: Array.isArray(res.data) ? res.data.length : 1,
                  totalPages: 1,
                },
              };
            } else {
              let meta = res.meta.pagination;

              ctx.body = {
                data: res.data,
                meta: {
                  count: res.data.length,
                  total: meta?.total_items,
                  page: parseInt(page),
                  pageSize: parseInt(limit),
                  totalPages: Math.ceil(meta?.total_items / limit),
                },
              };
            }
          } catch (error: any) {
            ctx.throw(500, error.message);
          }
          await next();
        },

        // Get single item action
        get: async (ctx: any, next) => {
          try {
            const id = ctx.action.params.filterByTk || ctx.params.id;

            if (!id) {
              ctx.throw(400, 'ID is required');
            }

            const response = await fetch(`${config.servicesApiUrl}/orders/back-office/${id}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });
            const res = await response.json();

            if (!res?.data) {
              ctx.throw(404, 'Order not found');
            }

            ctx.body = { data: res.data };
          } catch (error: any) {
            ctx.throw(404, 'Not found');
          }
          await next();
        },

        // list order payments action
        listPayments: async (ctx: any, next) => {
          try {
            const { page = 1, pageSize = 20, order_reference = '' } = ctx.action.params;

            if (!order_reference) {
              ctx.throw(400, 'Order reference is required');
            }

            const response = await fetch(
              `${config.servicesApiUrl}/payments-v2/back-office/order-payments?order_reference=${order_reference}`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                },
              },
            );
            const res = await response.json();

            // Ensure hustles exists and is an array
            if (!res?.data) {
              ctx.body = {
                data: [],
                meta: {
                  count: 0,
                  total: 0,
                  page: parseInt(String(page)),
                  pageSize: parseInt(String(pageSize)),
                  totalPages: 0,
                },
              };
              return await next();
            }

            ctx.body = { data: res.data };
          } catch (error: any) {
            ctx.throw(404, 'Not found');
          }

          await next();
        },

        resend: async (ctx, next) => {
          const { order_reference = '' } = ctx.action.params;
          try {
            const response = await fetch(`${config.servicesApiUrl}/orders/back-office/resend-ticket`, {
              method: 'POST',
              body: JSON.stringify({ orderReference: order_reference }),
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (!res?.data) {
              ctx.throw(404, 'Could not resend order, try again later');
            }

            ctx.body = { data: res.data };
          } catch (error: any) {
            ctx.throw(404, 'Not found');
          }
          await next();
        },

        regenerate: async (ctx, next) => {
          const { order_id = '' } = ctx.action.params;
          try {
            const response = await fetch(`${config.servicesApiUrl}/orders/back-office/regenerate-ticket`, {
              method: 'POST',
              body: JSON.stringify({ orderId: order_id }),
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (!res?.data) {
              ctx.throw(404, 'Could not regenerate order, try again later');
            }

            ctx.body = { data: res.data };
          } catch (error: any) {
            ctx.throw(404, 'Not found');
          }
          await next();
        },

        delete: async (ctx, next) => {
          const id = ctx.action.params.filterByTk || ctx.params.id;
          try {
            const response = await fetch(`${config.servicesApiUrl}/orders/back-office/cancel-order/${id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (!res?.data) {
              ctx.throw(404, 'Could not cancel order, try again later');
            }

            ctx.body = { data: res.data };
          } catch (error: any) {
            ctx.throw(404, 'Not found');
          }

          await next();
        },

        confirm: async (ctx, next) => {
          const { order_reference = '' } = ctx.action.params;

          try {
            const response = await fetch(`${config.servicesApiUrl}/payments-v2/back-office/confirm-payment`, {
              method: 'POST',
              body: JSON.stringify({ orderReference: order_reference }),
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            if (response.ok) {
              ctx.body = {
                message: 'Payment confirmed!',
              };
            }
          } catch (error: any) {
            ctx.throw(404, 'Not found');
          }
          await next();
        },

        refund: async (ctx, next) => {
          const user = ctx.state.currentUser;

          const { reason = '', order = '' } = ctx.action.params;

          try {
            const response = await fetch(`${config.coreApiUrl}/refund/6`, {
              method: 'POST',
              body: JSON.stringify({ reason, order, user: user.email }),
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

        verifyPayment: async (ctx, next) => {
          const { transaction_reference = '', order_reference = '', amount = '' } = ctx.action.params;

          try {
            const response = await fetch(`${config.servicesApiUrl}/payments-v2/handle-callback/daraja-paybill`, {
              method: 'POST',
              body: JSON.stringify({
                ManuallyVerified: true,
                TransID: transaction_reference,
                BillRefNumber: order_reference,
                TransAmount: amount,
              }),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            });

            const res = await response.json();

            if (!res) {
              ctx.throw(404, res?.message || 'Could not verify payment, try again later');
            }

            ctx.body = { data: res.message };
          } catch (error: any) {
            ctx.throw(404, error?.message || 'Could not verify payment, try again later');
          }
          await next();
        },

        // Get single item action
        getHustle: async (ctx: any, next) => {
          try {
            const id = ctx.action.params.filterByTk || ctx.params.id;

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
      },
    });

    // for hustles
    this.app.resourceManager.define({
      name: 'hustles',
      actions: {
        // List action - get all items

        list: async (ctx: any, next) => {
          const { page = 0, limit = 30, search = '' } = ctx.action.params;

          // Build query parameters

          try {
            // Fetch from external API
            const response = await fetch(
              `${config.coreApiUrl}/getAllHustles?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
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
                  page: parseInt(page),
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
                page: parseInt(page),
                pageSize: parseInt(limit),
                totalPages: Math.ceil(res.total / limit),
              },
            };
          } catch (error: any) {
            ctx.throw(500, error.message);
          }
          await next();
        },

        // Get single item action
        get: async (ctx: any, next) => {
          try {
            const id = ctx.action.params.filterByTk || ctx.params.id;

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

        // Get products belonging to a hustle
        listProducts: async (ctx: any, next) => {
          const { page = 1, limit = 20, shop_id = '' } = ctx.action.params;

          if (!shop_id) {
            ctx.throw(400, 'A shop ID is required');
          }

          try {
            // Fetch from external API
            const response = await fetch(
              `${config.servicesApiUrl}/products/back-office?limit=${limit}&page=${page}&store_id=${shop_id}`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                },
              },
            );
            let res = await response.json();

            // Ensure data exists and is an array
            if (!res?.data) {
              ctx.body = {
                data: [],
                meta: {
                  count: 0,
                  total: 0,
                  page: parseInt(page),
                  pageSize: parseInt(limit),
                  totalPages: 0,
                },
              };
              return await next();
            }

            let meta = res.meta.pagination;

            ctx.body = {
              data: res.data,
              meta: {
                count: res.data.length,
                total: meta?.total_items,
                page: parseInt(page),
                pageSize: parseInt(limit),
                totalPages: Math.ceil(meta?.total_items / limit),
              },
            };
          } catch (error: any) {
            ctx.throw(404, 'Products Not found');
          }
          await next();
        },

        // Get users belonging to a hustle
        listUsers: async (ctx: any, next) => {
          const { account = '' } = ctx.action.params;

          if (!account) {
            ctx.throw(400, 'Account is required');
          }

          try {
            // Fetch from external API
            const response = await fetch(`${config.coreApiUrl}/account/users/${account}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            let res = await response.json();

            // Ensure data exists and is an array
            if (!res?.profile) {
              ctx.body = {
                data: [],
              };

              return await next();
            }

            ctx.body = { data: res.profile };
          } catch (error: any) {
            ctx.throw(404, 'Users Not found');
          }
          await next();
        },

        suspend: async (ctx, next) => {
          const { account = '' } = ctx.action.params;
          try {
            const response = await fetch(`${config.coreApiUrl}/account/suspend/${account}`, {
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

        getProduct: async (ctx: any, next) => {
          try {
            const id = ctx.action.params.filterByTk || ctx.params.id;
            const { store_id = '' } = ctx.action.params;

            if (!store_id) {
              ctx.throw(400, 'Store ID is required');
            }

            const response = await fetch(`${config.servicesApiUrl}/products/back-office/${id}?store_id=${store_id}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            const res = await response.json();

            if (!res?.data) {
              ctx.throw(404, 'Hustle not found');
            }

            const data = res?.data;

            ctx.body = { data };
          } catch (error: any) {
            ctx.throw(404, error?.message || 'Not found');
          }

          await next();
        },

        addUser: async (ctx, next) => {
          // Get current user information
          const currentUser = ctx.state.currentUser;
          const { account = '' } = ctx.action.params;

          if (!currentUser) {
            ctx.throw(401, 'User not authenticated');
          }

          try {
            const response = await fetch(`${config.coreApiUrl}/user/${currentUser.email}/add/${account}`, {
              headers: {
                Authorization: `Basic ${credentials}`,
              },
            });

            let res = await response.json();

            if (res.success === false) {
              ctx.throw(404, res?.message);
            } else {
              ctx.body = {
                message: 'User added',
              };
            }
          } catch (error: any) {
            ctx.throw(404, error?.message || 'Not found');
          }

          await next();
        },

        suspendUser: async (ctx, next) => {
          const { account = '' } = ctx.action.params;
          try {
            const response = await fetch(`${config.coreApiUrl}/account/suspend/${account}`, {
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
      },
    });

    // for bookings
    this.app.resourceManager.define({
      name: 'bookings',

      actions: {
        getMOIBookings: async (ctx, next) => {
          const { account = '', page = 0, limit = 30, search = '' } = ctx.action.params;

          if (!account) {
            ctx.throw(400, 'Account is required');
          }

          try {
            // Fetch from external API
            const response = await fetch(
              `${config.coreApiUrl}/order/search/${account}?page=${page}&limit=${limit}${search ? `&search_term=${search}` : ''}&status=3`,
              {
                headers: {
                  Authorization: `Basic ${credentials}`,
                },
              },
            );

            let res = await response.json();

            // Ensure hustles exists and is an array
            if (!res?.orders || !Array.isArray(res.orders)) {
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
              data: res.orders,
              meta: {
                count: res.total,
                total: res.total,
                page,
                pageSize: parseInt(limit),
                totalPages: Math.ceil(res.total / limit),
              },
            };
          } catch (error: any) {
            ctx.throw(404, 'Bookings Not found');
          }
          await next();
        },
      },
    });

    this.app.resourceManager.define({
      name: 'client-config',

      actions: {
        get: (ctx) => {
          ctx.body = config;
        },
      },
    });

    // Allow public access
    this.app.acl.allow('user', '*', 'loggedIn');
    this.app.acl.allow('orders', '*', 'loggedIn');
    this.app.acl.allow('bookings', '*', 'loggedIn');
    this.app.acl.allow('hustles', '*', 'loggedIn');
    this.app.acl.allow('client-config', 'get', 'public');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginSupportServer;
