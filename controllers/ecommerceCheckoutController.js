const Razorpay = require("razorpay");
const Product = require("../models/Product");
const Order = require("../models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createEcommerceCheckoutOrder = async (req, res) => {
  try {
    const { items, workspaceId, customerName, customerEmail } = req.body;

    // Get authenticated user
    const userId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required",
      });
    }

    let totalAmount = 0;
    const orderProducts = [];

    // Validate each product
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity",
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available for ${product.name}`,
        });
      }

      // Calculate total
      totalAmount += product.price * quantity;

      // Save product snapshot for MongoDB Order
      orderProducts.push({
        product: product._id,
        quantity: quantity,
        price: product.price,
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    // Razorpay expects paise
    const amountPaise = Math.round(totalAmount * 100);

    // ==========================================
    // 1. CREATE RAZORPAY ORDER
    // ==========================================

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `ecommerce_${Date.now()}`,
    });

    console.log(
      "RAZORPAY ORDER CREATED:",
      razorpayOrder.id
    );

    // ==========================================
    // 2. CREATE MONGODB ORDER
    // ==========================================

    const mongoOrder = await Order.create({
      user: userId,

      products: orderProducts,

      totalAmount: totalAmount,

      paymentId: null,

      paymentStatus: "Pending",

      orderStatus: "Pending",

      shippingAddress: "",

      phoneNumber: "",

      orderNotes: "",

      razorpayOrderId: razorpayOrder.id,

      paymentReference: null,
    });

    console.log(
      "MONGODB ORDER CREATED:",
      mongoOrder._id
    );

    // ==========================================
    // 3. RETURN RESPONSE
    // ==========================================

    return res.status(200).json({
        order: mongoOrder,

        payment: {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        },
        });
  } catch (error) {
    console.error(
      "E-COMMERCE CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create ecommerce checkout order",
      error: error.message,
    });
  }
};