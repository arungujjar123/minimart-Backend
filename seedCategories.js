// Test script to add some sample categories and products
const mongoose = require("mongoose");

// Import models
const Product = require("./models/Product");
const Category = require("./models/Category");

mongoose.connect("mongodb://localhost:27017/minimart", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 79.99,
    category: "Electronics",
    imageUrl:
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
    stock: 50,
  },
  {
    name: "Smart Phone",
    description: "Latest smartphone with advanced camera and features",
    price: 599.99,
    category: "Electronics",
    imageUrl:
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
    stock: 30,
  },
  {
    name: "Programming Book",
    description: "Learn modern web development with practical examples",
    price: 45.99,
    category: "Books",
    imageUrl:
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
    stock: 20,
  },
];

async function seedData() {
  try {
    console.log("🌱 Starting to seed data...");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Add categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ Added ${createdCategories.length} categories`);

    // Add products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Added ${createdProducts.length} products`);

    console.log("🎉 Sample data seeded successfully!");

    // Show summary
    const categoryCounts = {};
    for (const product of createdProducts) {
      categoryCounts[product.category] =
        (categoryCounts[product.category] || 0) + 1;
    }

    console.log("\n📊 Product distribution by category:");
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    mongoose.connection.close();
  }
}

seedData();
