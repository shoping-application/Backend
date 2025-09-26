const mongoose = require("mongoose");

const userOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "out_for_delivery", "delivered", "canceled"],
      default: "pending",
      required: true,
    },

    orderId:{
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", userOrderSchema);
