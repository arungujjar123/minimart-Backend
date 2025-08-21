// Quick script to check and fix the database product image fields
const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://localhost:27017/minimart", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixImageFields() {
  try {
    console.log("🔍 Checking product image fields...");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};

      // If product has 'image' field but not 'imageUrl', copy it over
      if (product.image && !product.imageUrl) {
        updateData.imageUrl = product.image;
        needsUpdate = true;
      }

      // If product has 'imageUrl' but not 'image', we're good (this is preferred)
      // If product has neither, that's also okay (will use fallback)

      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, updateData);
        console.log(`✅ Updated product: ${product.name}`);
        updatedCount++;
      }
    }

    console.log(`🎉 Updated ${updatedCount} products with imageUrl field`);

    // Show current state
    const updatedProducts = await Product.find({});
    console.log("\n📊 Current product image fields:");
    updatedProducts.forEach((product) => {
      console.log(
        `${product.name}: ${
          product.imageUrl ? "✅ imageUrl" : "❌ no imageUrl"
        } ${product.image ? "(has image)" : ""}`
      );
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.connection.close();
  }
}

fixImageFields();
