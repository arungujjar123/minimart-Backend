const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// Search products
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get featured products from different categories (max 5)
router.get("/featured", async (req, res) => {
  try {
    console.log("Featured products endpoint called");

    // First, try to get products from different categories
    const allProducts = await Product.find();
    console.log("Total products found:", allProducts.length);

    if (allProducts.length === 0) {
      return res.json([]);
    }

    // Group products by category
    const productsByCategory = {};
    allProducts.forEach((product) => {
      const category = product.category || "Uncategorized";
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push(product);
    });

    console.log("Categories found:", Object.keys(productsByCategory));

    // Get one product from each category (max 5)
    const featuredProducts = [];
    const categories = Object.keys(productsByCategory);
    const maxProducts = 5;

    for (let i = 0; i < Math.min(categories.length, maxProducts); i++) {
      const category = categories[i];
      const products = productsByCategory[category];
      if (products && products.length > 0) {
        // Get the first product from this category
        featuredProducts.push(products[0]);
      }
    }

    // If we have less than 5 products, fill with additional random products
    if (
      featuredProducts.length < maxProducts &&
      allProducts.length > featuredProducts.length
    ) {
      const usedIds = featuredProducts.map((p) => p._id.toString());
      const remainingProducts = allProducts.filter(
        (p) => !usedIds.includes(p._id.toString())
      );
      const remainingCount = Math.min(
        maxProducts - featuredProducts.length,
        remainingProducts.length
      );

      for (let i = 0; i < remainingCount; i++) {
        featuredProducts.push(remainingProducts[i]);
      }
    }

    console.log("Featured products selected:", featuredProducts.length);
    res.json(featuredProducts);
  } catch (err) {
    console.error("Error in featured products endpoint:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// This route provides endpoints to get all products and a single product by ID.
module.exports = router;
