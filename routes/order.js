const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth");
const router = express.Router();

// Checkout and create order
router.post("/checkout", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Filter out any cart items with null/deleted products
    const validItems = cart.items.filter((item) => item.product !== null);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    const order = new Order({
      user: req.userId,
      items: validItems,
      total: validItems.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      ),
    });
    await order.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate(
      "items.product"
    );

    // Filter out items with null/deleted products
    const cleanedOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter((item) => item.product !== null),
      // Recalculate total for orders with deleted products
      total: order.items
        .filter((item) => item.product !== null)
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }));

    res.json(cleanedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an order
router.delete("/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find and verify the order belongs to the authenticated user
    const order = await Order.findOne({ _id: orderId, user: req.userId });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// This route handles order creation (checkout) and fetching user orders. It uses auth middleware for security.
module.exports = router;
