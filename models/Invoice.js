const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({

  invoiceId: String,

  userId: String,

  paymentId: String,

  amount: Number,

  gst: Number,

  total: Number,

  status: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "Invoice",
  invoiceSchema
);