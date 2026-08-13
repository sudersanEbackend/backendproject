const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },

    // For template clone project
    name: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    // For manually created projects
    projectName: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    builderData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    htmlContent: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Project",
  projectSchema
);