const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number, // Price at time of order
    },
  ],
  total_amount: Number,
  payment_method: { type: String, default: "cod" }, // cod (cash on delivery), online
  payment_status: { type: String, default: "pending" }, // pending, completed, failed
  order_status: { type: String, default: "confirmed" }, // confirmed, processing, shipped, delivered
  shipping_address: String,
  createdAt: { type: Date, default: Date.now },
});

// This schema defines an order with user, items, total price, payment details, and creation date.
module.exports = mongoose.model("Order", orderSchema);
