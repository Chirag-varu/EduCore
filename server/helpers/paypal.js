import pkg from "paypal-rest-sdk";

const paypal = pkg;

paypal.configure({
  mode: "sandbox", // or "live"
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_ID,
});

export default paypal;
