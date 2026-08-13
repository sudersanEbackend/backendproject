const express = require("express");

const router = express.Router();

const {
  getBlocks,
  getBlocksByView,
  createBlock,
  searchBlocks
} = require("../controllers/blockController");

router.get("/",getBlocks);

router.get("/view",getBlocksByView);

router.post("/", createBlock); 

router.get("/search",searchBlocks);

module.exports=router;