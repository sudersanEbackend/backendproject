const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String, required: true },
    image: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);