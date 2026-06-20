export default (plugin: any) => {
  console.log('Users-permissions plugin extension loaded: wrapping auth and user controllers.');

  // ─── 1. OVERRIDE AUTH.CALLBACK (FACTORY WRAPPER) ────────────────────────────
  const originalAuthFactory = plugin.controllers.auth;

  plugin.controllers.auth = ({ strapi }: { strapi: any }) => {
    const originalAuth = originalAuthFactory({ strapi });

    return {
      ...originalAuth,
      async callback(ctx: any) {
        // Call the original login logic
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

  // ─── 2. OVERRIDE USER.ME (PLAIN OBJECT PROPERTIES) ──────────────────────────
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx: any) => {
    // Call the original me logic
    await originalMe(ctx);

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
  };

  return plugin;
};
