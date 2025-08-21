const express = require("express");
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const router = express.Router();

// Simple checkout without payment gateway - creates order directly
router.post("/simple-checkout", auth, async (req, res) => {
  try {
    const { shipping_address } = req.body;

    if (!shipping_address) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const cart = await Cart.findOne({ user: req.userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Filter out any cart items with null/deleted products
    const validItems = cart.items.filter((item) => item.product !== null);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    const total_amount = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order directly (Cash on Delivery / Simple checkout)
    const order = new Order({
      user: req.userId,
      items: validItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total_amount,
      shipping_address,
      payment_status: "pending", // Cash on delivery
      payment_method: "cod",
      order_status: "confirmed",
    });

    await order.save();

    // Clear the cart after successful order
    await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });

    res.json({
      success: true,
      message: "Order placed successfully! You will pay cash on delivery.",
      order_id: order._id,
      total_amount,
      payment_method: "Cash on Delivery",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
});

module.exports = router;

// Initialize Razorpay with proper error handling
let razorpay;
try {
  console.log("Initializing Razorpay with:", {
    key_id: process.env.RAZORPAY_KEY_ID ? "Set" : "Missing",
    key_secret: process.env.RAZORPAY_KEY_SECRET ? "Set" : "Missing",
  });

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Razorpay credentials missing in environment variables");
  } else {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("Razorpay initialized successfully");
  }
} catch (error) {
  console.error("Razorpay initialization failed:", error);
}

// Create Razorpay order
router.post("/create-order", auth, async (req, res) => {
  try {
    console.log("Create order request received");
    console.log("User ID:", req.userId);
    console.log("Razorpay instance:", razorpay ? "Available" : "Not available");

    if (!razorpay) {
      console.error("Razorpay not initialized");
      return res.status(500).json({
        message:
          "Payment service not configured properly. Please contact support.",
      });
    }

    const cart = await Cart.findOne({ user: req.userId }).populate(
      "items.product"
    );
    console.log("Cart found:", cart ? `${cart.items.length} items` : "No cart");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Filter out any cart items with null/deleted products
    const validItems = cart.items.filter((item) => item.product !== null);
    console.log("Valid items:", validItems.length);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    const amount = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    console.log("Total amount:", amount);

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (INR)
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: req.userId,
        cart_items: validItems.length,
      },
    };

    console.log("Creating Razorpay order with options:", options);
    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder.id);

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      description: error.description,
    });

    res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Verify payment and complete order
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shipping_address,
    } = req.body;

    // Verify payment signature
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "your_razorpay_key_secret"
      )
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Payment verified successfully, create order
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const validItems = cart.items.filter((item) => item.product !== null);
    const total = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.userId,
      items: validItems,
      total: total,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentStatus: "paid",
      shippingAddress: shipping_address || "Not provided",
    });

    await order.save();

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    res.json({
      message: "Payment verified and order created successfully",
      orderId: order._id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;
