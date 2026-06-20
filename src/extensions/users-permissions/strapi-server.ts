export default (plugin: any) => {
  console.log('Users-permissions plugin extension loaded: wrapping auth and user controller factories.');
  
  const originalAuthFactory = plugin.controllers.auth;
  const originalUserFactory = plugin.controllers.user;

  // Override the auth controller factory
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

  // Override the user controller factory
  plugin.controllers.user = ({ strapi }: { strapi: any }) => {
    const originalUser = originalUserFactory({ strapi });

    return {
      ...originalUser,
      async me(ctx: any) {
        // Call the original me controller method
        await originalUser.me(ctx);

        // If it succeeded and ctx.body contains the user data, query database to get the role
        if (ctx.body) {
          try {
            const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
              where: { id: ctx.body.id },
              populate: ['role'],
            });

            if (userWithRole && userWithRole.role) {
              ctx.body.role = userWithRole.role.type;
            }
          } catch (err) {
            strapi.log.error('Failed to append role to me response:', err);
          }
        }
      },
    };
  };

  return plugin;
};
