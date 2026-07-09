const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        productName: String,
        brand: String,
        quantity: Number,
        price: mongoose.Schema.Types.Decimal128,
        subTotal: mongoose.Schema.Types.Decimal128,
      },
    ],
    pricing: {
      subTotal: mongoose.Schema.Types.Decimal128,
      discount: mongoose.Schema.Types.Decimal128,
      shippingFee: Number,
      tax: mongoose.Schema.Types.Decimal128,
      total: mongoose.Schema.Types.Decimal128,
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    payment: {
      method: {
        type: String,
        enum: ["cod", "online"],
        default: "cod",
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "failed", "paid", "refunded"],
        default: "pending",
      },
      paidAt: Date,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "waiting_for_return_approval",
        "returned",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        changedAt: Date,
      },
    ],
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    return: {
      initiatedAt: Date,
      returnReason: String,
      status: {
        type: String,
        enum: [
          "pending",
          "out_for_pickup",
          "order_received",
          "approved",
          "completed",
          "rejected",
        ],
        default: "pending",
      },
    },
    returnedAt: Date,
    cancellationReason: String,
    notes: String,
  },
  {
    timestamps: true,
  },
);

const OrderModel = mongoose.model("order", orderSchema);

module.exports = OrderModel;
