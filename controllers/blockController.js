const Block = require("../models/Block");

// Get All Blocks
exports.getBlocks = async (req, res) => {
  try {
    const blocks = await Block.find();

    res.status(200).json({
      success: true,
      blocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Block
exports.createBlock = async (req, res) => {
  try {
    const block = await Block.create(req.body);

    res.status(201).json({
      success: true,
      message: "Block created successfully",
      block,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Blocks By View
exports.getBlocksByView = async (req, res) => {
  try {
    const { view } = req.query;

    const blocks = await Block.find({
      view,
    });

    res.status(200).json({
      success: true,
      blocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search Blocks
exports.searchBlocks = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    let filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    let query = Block.find(filter);

    if (sort === "name") {
      query = query.sort({ name: 1 });
    }

    if (sort === "latest") {
      query = query.sort({ createdAt: -1 });
    }

    const blocks = await query;

    res.status(200).json({
      success: true,
      blocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};