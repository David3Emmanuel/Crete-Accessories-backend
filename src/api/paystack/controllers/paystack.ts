import { createHmac } from "crypto";
import type { Context } from "koa";

export default {
  async webhook(ctx: Context) {
    const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
    const hash = createHmac("sha512", secret)
      .update(JSON.stringify(ctx.request.body))
      .digest("hex");

    if (hash !== ctx.request.headers["x-paystack-signature"]) {
      ctx.status = 401;
      return;
    }

    const { event, data } = ctx.request.body as {
      event: string;
      data: { reference: string };
    };

    if (event === "charge.success") {
      const orders = await strapi.entityService.findMany("api::order.order", {
        filters: { paystackReference: data.reference },
      });

      if (orders.length > 0) {
        await strapi.entityService.update("api::order.order", orders[0].id, {
          data: { status: "paid" },
        });
      }
    }

    ctx.status = 200;
    ctx.body = { received: true };
  },

  async health(ctx: Context) {
    ctx.body = { status: "ok", timestamp: new Date().toISOString() };
  },
};
