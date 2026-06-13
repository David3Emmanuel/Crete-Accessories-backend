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
    } catch (err) {
      console.error('Failed to bootstrap RBAC permissions:', err);
    }
  },
};
