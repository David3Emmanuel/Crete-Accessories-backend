import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("You must be logged in to view orders.");
      }

      ctx.query.filters = {
        ...(ctx.query.filters as any),
        user: { id: user.id },
      };

      return await super.find(ctx);
    },

    async findOne(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("You must be logged in to view orders.");
      }

      const { id } = ctx.params;
      const order = await strapi.entityService.findOne("api::order.order", id, {
        populate: ["user"],
      });

      if (!order || (order.user && (order.user as any).id !== user.id)) {
        return ctx.notFound();
      }

      return await super.findOne(ctx);
    },
  })
);
