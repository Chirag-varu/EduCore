import paypal from "paypal-rest-sdk";

paypal.configure({
  mode: "sandbox", // or "live"
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_ID,
});

// Export the payment object for creating/executing payments
export default paypal.payment;
