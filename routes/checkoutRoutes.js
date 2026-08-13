const express = require("express");
const router = express.Router();

const {
  createEcommerceCheckoutOrder,
} = require("../controllers/ecommerceCheckoutController");

const {
  verifyPayment,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

// CREATE ECOMMERCE CHECKOUT ORDER
router.post(
  "/create-order",
  protect,
  createEcommerceCheckoutOrder
);

// VERIFY ECOMMERCE PAYMENT
router.post(
  "/verify-payment",
  protect,
  verifyPayment
);

module.exports = router;