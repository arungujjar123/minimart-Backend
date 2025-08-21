// Script to completely clear and reseed the database
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

async function clearAndReseed() {
  try {
    await mongoose.connect("mongodb://localhost:27017/minimart", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🗑️ Clearing all data from database...");

    // Clear using mongoose methods
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log("✅ Database cleared completely");

    // Now create fresh data
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

    // Add categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ Added ${createdCategories.length} categories`);

    // Add products with imageUrl field
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(
      `✅ Added ${createdProducts.length} products with imageUrl field`
    );

    console.log("🎉 Database reseeded successfully!");

    // Verify the data
    console.log("\n🔍 Verifying products have correct fields:");
    const products = await Product.find();
    products.forEach((product) => {
      console.log(
        `${
          product.name
        }: imageUrl=${!!product.imageUrl}, image=${!!product.image}`
      );
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.connection.close();
  }
}

clearAndReseed();
