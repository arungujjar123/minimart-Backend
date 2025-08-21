// Script to seed MongoDB Atlas with sample data
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

async function seedAtlasDatabase() {
  try {
    console.log("🌐 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB Atlas successfully!");
    console.log("Database:", mongoose.connection.name);

    // Clear existing data
    console.log("🗑️ Clearing existing data from Atlas...");
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("✅ Atlas database cleared");

    // Sample categories
    const sampleCategories = [
      { name: "Electronics", description: "Electronic devices and gadgets" },
      { name: "Clothing", description: "Apparel and fashion items" },
      {
        name: "Home & Garden",
        description: "Home improvement and garden supplies",
      },
      { name: "Books", description: "Books and educational materials" },
      { name: "Sports", description: "Sports equipment and accessories" },
    ];

    // Sample products with both image and imageUrl for compatibility
    const sampleProducts = [
      {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 79.99,
        category: "Electronics",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        stock: 25,
      },
      {
        name: "Cotton T-Shirt",
        description: "Comfortable 100% cotton t-shirt in multiple colors",
        price: 19.99,
        category: "Clothing",
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        stock: 50,
      },
      {
        name: "Smart Phone",
        description: "Latest smartphone with advanced camera and features",
        price: 599.99,
        category: "Electronics",
        imageUrl:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
        stock: 15,
      },
      {
        name: "Garden Hose",
        description: "50-foot expandable garden hose with spray nozzle",
        price: 29.99,
        category: "Home & Garden",
        imageUrl:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop",
        stock: 30,
      },
      {
        name: "Programming Book",
        description: "Learn modern web development with practical examples",
        price: 45.99,
        category: "Books",
        imageUrl:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop",
        stock: 40,
      },
      {
        name: "Basketball",
        description: "Official size basketball for indoor and outdoor play",
        price: 24.99,
        category: "Sports",
        imageUrl:
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=500&fit=crop",
        stock: 20,
      },
      {
        name: "Laptop Stand",
        description: "Ergonomic adjustable laptop stand for better posture",
        price: 39.99,
        category: "Electronics",
        imageUrl:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
        stock: 35,
      },
      {
        name: "Running Shoes",
        description: "Comfortable athletic shoes for running and workouts",
        price: 89.99,
        category: "Sports",
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
        stock: 40,
      },
    ];

    // Add categories to Atlas
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`🏷️ Added ${createdCategories.length} categories to Atlas`);

    // Add products to Atlas
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`📦 Added ${createdProducts.length} products to Atlas`);

    console.log("🎉 MongoDB Atlas seeded successfully!");

    // Show summary
    console.log("\n📊 Product distribution by category in Atlas:");
    const categoryCounts = {};
    for (const product of createdProducts) {
      categoryCounts[product.category] =
        (categoryCounts[product.category] || 0) + 1;
    }

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    console.log("\n🌐 Your e-commerce app is now connected to MongoDB Atlas!");
    console.log("✅ All data will now be stored in the cloud");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding Atlas database:", error);
    mongoose.connection.close();
  }
}

seedAtlasDatabase();
