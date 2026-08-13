const express = require("express");
const multer = require("multer");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  uploadTemplate,
  getTemplates,
  createTemplate,
  cloneTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/templateController");

// ================= TEMPLATE ROUTES =================

// Upload Template Image
router.post(
  "/upload",
  upload.single("image"),
  uploadTemplate
);

// Get All Templates
// Frontend: GET /api/template/list
router.get(
  "/list",
  getTemplates
);

// Create Template
router.post(
  "/",
  upload.single("image"),
  createTemplate
);

// Get Template By ID or Slug
// Frontend: GET /api/template/:idOrSlug
router.get(
  "/:id",
  getTemplateById
);

// Update Template
router.put(
  "/:id",
  upload.single("image"),
  updateTemplate
);

// Delete Template
router.delete(
  "/:id",
  deleteTemplate
);

// Clone / Use Template
// Frontend: POST /api/template/:id/use
router.post(
  "/:id/use",
  protect,
  cloneTemplate
);

module.exports = router;