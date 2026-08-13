const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getStorefrontProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// -----------------------------
// Frontend Compatible Routes
// -----------------------------

// Create Product
router.post("/product", createProduct);

// List Products (Dashboard)
router.get("/products/:workspaceId", getStorefrontProducts);

// Single Product
router.get("/product/:id", getProductById);

// Update Product
router.put("/product/:id", updateProduct);

// Delete Product
router.delete("/product/:id", deleteProduct);

// -----------------------------
// Existing Routes (Keep)
// -----------------------------

router.post("/", createProduct);

router.get("/", getAllProducts);

router.get("/store/:workspaceId/products", getStorefrontProducts);

router.get("/:id", getProductById);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;