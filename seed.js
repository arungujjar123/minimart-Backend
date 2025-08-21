require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const sampleProducts = [
  {
    name: "Gaming Laptop",
    description:
      "High-performance gaming laptop with RTX graphics and 16GB RAM",
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
  },
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with advanced camera system and A17 Pro chip",
    price: 999,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
  },
  {
    name: "AirPods Pro",
    description: "Wireless noise-cancelling earbuds with spatial audio",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=300&fit=crop",
  },
  {
    name: "iPad Air",
    description: "Lightweight tablet perfect for creativity and productivity",
    price: 599,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
  },
  {
    name: "MacBook Air",
    description: "Ultra-thin laptop with M2 chip and all-day battery life",
    price: 1199,
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
  },
  {
    name: "Sony WH-1000XM4",
    description: "Industry-leading noise canceling wireless headphones",
    price: 349,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
  },
  {
    name: "Samsung 4K Monitor",
    description: "27-inch 4K UHD monitor with HDR support",
    price: 449,
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with blue switches",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with precision tracking",
    price: 79,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
  },
  {
    name: "Webcam 1080p",
    description: "Full HD webcam with auto-focus and built-in microphone",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop",
  },
  {
    name: "Portable SSD 1TB",
    description: "Ultra-fast portable SSD with USB-C connectivity",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart rate monitor",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  },
];

console.log(process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log("Sample products added");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// This script seeds the database with sample products for testing.
