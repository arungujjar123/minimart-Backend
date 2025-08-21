const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middleware/adminAuth");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Category = require("../models/Category");

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are working!" });
});

// Admin Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Secret key for admin registration (security measure)
    const ADMIN_SECRET_KEY =
      process.env.ADMIN_SECRET_KEY || "MINIMART_ADMIN_2024";

    console.log("Admin registration attempt:", {
      name,
      email,
      hasPassword: !!password,
      secretKey: secretKey,
      expectedSecretKey: ADMIN_SECRET_KEY,
    });

    if (!secretKey) {
      console.log("No secret key provided");
      return res
        .status(403)
        .json({ message: "Secret key is required for admin registration" });
    }

    if (secretKey !== ADMIN_SECRET_KEY) {
      console.log(
        "Invalid secret key:",
        secretKey,
        "Expected:",
        ADMIN_SECRET_KEY
      );
      return res
        .status(403)
        .json({ message: "Invalid secret key for admin registration" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists" });
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password, // Will be hashed by the pre-save middleware
    });

    const admin = await newAdmin.save();

    // Generate JWT token
    const payload = {
      id: admin._id,
      email: admin.email,
      isAdmin: true,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          admin: {
            id: admin._id,
            email: admin.email,
            name: admin.name,
          },
          message: "Admin registered successfully",
        });
      }
    );
  } catch (error) {
    console.error("Admin registration error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // First check database for registered admin
    const admin = await Admin.findOne({ email, isActive: true });

    if (admin) {
      // Database admin login
      const isMatch = await admin.comparePassword(password);

      if (isMatch) {
        const payload = {
          id: admin._id,
          email: admin.email,
          isAdmin: true,
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: "24h" },
          (err, token) => {
            if (err) throw err;
            res.json({
              success: true,
              token,
              admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
              },
            });
          }
        );
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } else {
      // Fallback to demo credentials for backward compatibility
      const ADMIN_EMAIL = "admin@minimart.com";
      const ADMIN_PASSWORD = "admin123";

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const payload = {
          id: "demo-admin",
          email: ADMIN_EMAIL,
          isAdmin: true,
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: "24h" },
          (err, token) => {
            if (err) throw err;
            res.json({
              success: true,
              token,
              admin: {
                id: "demo-admin",
                email: ADMIN_EMAIL,
                name: "Demo Administrator",
              },
            });
          }
        );
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    }
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Dashboard Statistics
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    // Calculate total revenue
    const orders = await Order.find({ status: { $ne: "cancelled" } });
    const totalRevenue = orders.reduce((sum, order) => {
      const orderAmount = order.totalAmount || order.total || 0;
      return sum + orderAmount;
    }, 0);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        pendingOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Products for Admin
router.get("/products", adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get admin products error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Add New Product
router.post("/products", adminAuth, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock: stock || 0,
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (error) {
    console.error("Add product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Product
router.put("/products/:id", adminAuth, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, imageUrl, stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Product
router.delete("/products/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Orders for Admin
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get admin orders error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Order Status
router.put("/orders/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Update order status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== CATEGORY MANAGEMENT ROUTES ====================

// Get all categories
router.get("/categories", adminAuth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name,
        });
        return {
          ...category.toObject(),
          productCount,
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Get categories error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new category
router.post("/categories", adminAuth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({
      name,
      description: description || "",
    });

    const category = await newCategory.save();

    // Add productCount to response
    const categoryWithCount = {
      ...category.toObject(),
      productCount: 0,
    };

    res.status(201).json(categoryWithCount);
  } catch (error) {
    console.error("Add category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update category
router.put("/categories/:id", adminAuth, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const categoryId = req.params.id;

    // Check if another category with the same name exists (excluding current)
    if (name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: categoryId },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get product count
    const productCount = await Product.countDocuments({
      category: updatedCategory.name,
    });

    const categoryWithCount = {
      ...updatedCategory.toObject(),
      productCount,
    };

    res.json(categoryWithCount);
  } catch (error) {
    console.error("Update category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete category
router.delete("/categories/:id", adminAuth, async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if any products use this category
    const productCount = await Product.countDocuments({
      category: category.name,
    });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. ${productCount} product(s) are using this category. Please reassign or delete those products first.`,
      });
    }

    await Category.findByIdAndDelete(categoryId);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
