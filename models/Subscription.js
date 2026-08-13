const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({

  userId: String,

  planName: String,

  amount: Number,

  startDate: {
    type: Date,
    default: Date.now,
  },

  expiryDate: Date,

  status: {
    type: String,
    default: "Active",
  },
});

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);