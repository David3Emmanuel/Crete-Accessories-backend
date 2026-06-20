export default (plugin: any) => {
  console.log('Users-permissions plugin extension loaded: wrapping auth controller factory.');
  
  const originalAuthFactory = plugin.controllers.auth;

  // Override the controller factory
  plugin.controllers.auth = ({ strapi }: { strapi: any }) => {
    const originalAuth = originalAuthFactory({ strapi });

    return {
      ...originalAuth,
      async callback(ctx: any) {
        // Call the original login controller method
        await originalAuth.callback(ctx);

        // If login succeeded, query the database and append the role type
        if (ctx.body && ctx.body.user) {
          try {
            const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
              where: { id: ctx.body.user.id },
              populate: ['role'],
            });

            if (userWithRole && userWithRole.role) {
              ctx.body.user.role = userWithRole.role.type;
            }
          } catch (err) {
            strapi.log.error('Failed to append role to login response:', err);
          }
        }
      },
    };
  };

  return plugin;
};
