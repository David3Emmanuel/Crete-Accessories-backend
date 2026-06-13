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

    async create(ctx) {
      const user = ctx.state.user;
      const { data } = ctx.request.body;

      if (!data) {
        return ctx.badRequest("Missing data in request body.");
      }

      // Associate with authenticated user if present
      if (user) {
        data.user = user.id;
        data.guestEmail = null;
      } else {
        data.user = null;
      }

      const { items, ...orderData } = data;

      // Create core Order
      const order = await strapi.entityService.create("api::order.order", {
        data: {
          ...orderData,
          status: "pending",
        },
      });

      // Create OrderItems and link them to the Order
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await strapi.entityService.create("api::order-item.order-item", {
            data: {
              product: item.product,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
              variant: item.variant,
              order: order.id,
            },
          });
        }
      }

      // Return fully populated order
      const populatedOrder = await strapi.entityService.findOne("api::order.order", order.id, {
        populate: ["items", "items.product"],
      });

      return this.transformResponse(populatedOrder);
    },
  })
);

