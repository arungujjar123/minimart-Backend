const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: String,
    imageUrl: String,
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// This schema defines a product with name, description, price, image URL, category and stock.
module.exports = mongoose.model("Product", productSchema);
