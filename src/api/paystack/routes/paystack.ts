export default {
  routes: [
    {
      method: "POST",
      path: "/paystack/webhook",
      handler: "paystack.webhook",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/health",
      handler: "paystack.health",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
