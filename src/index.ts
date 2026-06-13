// import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }) {
    const rolePermissions = {
      public: [
        'api::category.category.find',
        'api::category.category.findOne',
        'api::product.product.find',
        'api::product.product.findOne',
        'api::order.order.create',
      ],
      authenticated: [
        'api::category.category.find',
        'api::category.category.findOne',
        'api::product.product.find',
        'api::product.product.findOne',
        'api::order.order.create',
        'api::order.order.find',
        'api::order.order.findOne',
      ],
    };

    try {
      const roleQuery = strapi.db.query('plugin::users-permissions.role');
      const permissionQuery = strapi.db.query('plugin::users-permissions.permission');

      // Fetch target roles
      const roles = await roleQuery.findMany({
        where: { type: { $in: Object.keys(rolePermissions) } },
      });

      for (const role of roles) {
        const allowedActions = rolePermissions[role.type] || [];

        // Fetch existing permissions for this role
        const existingPermissions = await permissionQuery.findMany({
          where: { role: role.id },
        });

        // Sync each allowed action
        for (const action of allowedActions) {
          const existing = existingPermissions.find((p) => p.action === action);
          if (existing) {
            if (!existing.enabled) {
              await permissionQuery.update({
                where: { id: existing.id },
                data: { enabled: true },
              });
            }
          } else {
            await permissionQuery.create({
              data: {
                action,
                role: role.id,
                enabled: true,
              },
            });
          }
        }
      }
      console.log('RBAC permissions successfully synced and automated.');

      // Subscribe to User lifecycles to link existing guest orders with the same email
      strapi.db.lifecycles.subscribe({
        models: ['plugin::users-permissions.user'],
        async afterCreate(event) {
          const { result } = event;
          if (result && result.email) {
            try {
              const orders = await strapi.db.query('api::order.order').findMany({
                where: {
                  guestEmail: result.email,
                  user: { id: { $null: true } },
                },
              });

              for (const order of orders) {
                await strapi.db.query('api::order.order').update({
                  where: { id: order.id },
                  data: {
                    user: result.id,
                    guestEmail: null,
                  },
                });
                strapi.log.info(`Linked guest order ${order.orderNumber} to new user account ${result.email}`);
              }
            } catch (err: any) {
              strapi.log.error(`Failed to link guest orders on user creation: ${err.message}`);
            }
          }
        },
      });
    } catch (err) {
      console.error('Failed to bootstrap RBAC permissions:', err);
    }
  },
};
