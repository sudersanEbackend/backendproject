const Order = require("../models/Order");
const Cart = require("../models/Cart");

// =====================================================
// GET ORDER SUMMARY
// =====================================================
exports.getOrderSummary = async (req, res) => {
  try {
    const { userId, productIds } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (
      !Array.isArray(productIds) ||
      productIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one product ID is required",
      });
    }

    const cart = await Cart.findOne({ userId }).populate(
      "products.productId",
      "name price image"
    );

    if (!cart || cart.products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Select only requested products
    const selectedProducts = cart.products.filter((item) =>
      item.productId &&
      productIds.includes(item.productId._id.toString())
    );

    if (selectedProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected products not found in cart",
      });
    }

    const products = selectedProducts.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.image,
      price: item.productId.price,
      quantity: item.quantity,
      subtotal: item.productId.price * item.quantity,
    }));

    const totalAmount = products.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        products,
        totalAmount,
      },
    });

  } catch (error) {
    console.error("Order Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// PLACE ORDER
// =====================================================
exports.placeOrder = async (req, res) => {
  try {
    const {
      userId,
      productIds,
      shippingAddress,
      phoneNumber,
      orderNotes,
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (
      !Array.isArray(productIds) ||
      productIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one product ID is required",
      });
    }

    if (!shippingAddress || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address and phone number are required",
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({
      userId,
    }).populate(
      "products.productId",
      "name price image"
    );

    if (!cart || cart.products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or empty",
      });
    }

    // =================================================
    // SELECT ONLY PRODUCTS TO BE PURCHASED
    // =================================================
    const selectedCartProducts = cart.products.filter(
      (item) =>
        item.productId &&
        productIds.includes(
          item.productId._id.toString()
        )
    );

    if (selectedCartProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Selected products not found in cart",
      });
    }

    // =================================================
    // VALIDATE SELECTED PRODUCTS
    // =================================================
    for (const item of selectedCartProducts) {
      if (!item.productId) {
        return res.status(404).json({
          success: false,
          message:
            "One or more selected products no longer exist",
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      if (item.productId.price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product price",
        });
      }
    }

    // =================================================
    // PREPARE ORDER PRODUCTS
    // =================================================
    const products = selectedCartProducts.map(
      (item) => ({
        product: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
      })
    );

    // =================================================
    // CALCULATE TOTAL ONLY FOR SELECTED PRODUCTS
    // =================================================
    const totalAmount = selectedCartProducts.reduce(
      (total, item) =>
        total +
        item.productId.price * item.quantity,
      0
    );

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // =================================================
    // CREATE ORDER
    // =================================================
    const order = await Order.create({
      user: userId,
      products,
      totalAmount,
      shippingAddress,
      phoneNumber,
      orderNotes,
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    // =================================================
    // IMPORTANT:
    // DO NOT REMOVE PRODUCTS FROM CART HERE.
    //
    // Cart will be updated only after successful
    // Razorpay payment verification.
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });

  } catch (error) {
    console.error("Place Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET USER ORDERS
// =====================================================
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.params.userId,
    })
      .populate("products.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET SINGLE ORDER
// =====================================================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    )
      .populate("user")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET ALL ORDERS
// =====================================================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("products.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// UPDATE ORDER STATUS
// =====================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatus = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatus.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: orderStatus,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET PENDING ORDERS
// =====================================================
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: "Pending",
    })
      .populate("user")
      .populate("products.product");

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET DELIVERED ORDERS
// =====================================================
exports.getDeliveredOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: "Delivered",
    })
      .populate("user")
      .populate("products.product");

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// CANCEL ORDER
// =====================================================
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.orderStatus === "Delivered"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delivered orders cannot be cancelled",
      });
    }

    order.orderStatus = "Cancelled";

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: "Cancelled",
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// SAVE PAYMENT REFERENCE
// =====================================================
exports.savePaymentReference = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          paymentReference:
            req.body.paymentReference,
        },
        {
          new: true,
        }
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment reference updated successfully",
      data: order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// FILTER ORDERS BY DATE
// =====================================================
exports.filterOrdersByDate = async (
  req,
  res
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Start date and end date are required",
      });
    }

    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("user")
      .populate("products.product");

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET REVENUE
// =====================================================
exports.getRevenue = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: "Paid",
    });

    const revenue = orders.reduce(
      (total, order) =>
        total + order.totalAmount,
      0
    );

    return res.status(200).json({
      success: true,
      revenue,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};