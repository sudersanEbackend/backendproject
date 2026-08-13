const razorpay = require("../config/razorpay");

const createRazorpayOrder = async (amount) => {

  const options = {
    amount,
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  return order;
};

const getPaymentDetails = async (paymentId) => {

  const payment = await razorpay.payments.fetch(paymentId);

  return {
    paymentId: payment.id,
    orderId: payment.order_id,
    amount: payment.amount / 100,
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    bank: payment.bank || null,
    wallet: payment.wallet || null,
    vpa: payment.vpa || null,
    email: payment.email || null,
    contact: payment.contact || null,
    createdAt: payment.created_at,
  };
};

module.exports = {
  createRazorpayOrder,
  getPaymentDetails,
};