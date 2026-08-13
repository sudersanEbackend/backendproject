const express = require("express");

const router = express.Router();

const {
  getOrderSummary,
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getPendingOrders,
  getDeliveredOrders,
  cancelOrder,
  getRevenue,
  savePaymentReference,
  filterOrdersByDate,
} = require("../controllers/orderController");

router.post("/summary", getOrderSummary);

router.post("/place", placeOrder);

router.get("/", getAllOrders);

router.get("/pending", getPendingOrders);

router.get("/delivered", getDeliveredOrders);

router.get("/revenue", getRevenue);

// Date Filter
router.get("/filter/date", filterOrdersByDate);

router.get("/user/:userId", getUserOrders);

router.get("/:id", getOrderById);

router.put("/:id/status", updateOrderStatus);

router.put("/:id/cancel", cancelOrder);

// Payment Reference Update
router.put("/:id/payment", savePaymentReference);

module.exports = router;