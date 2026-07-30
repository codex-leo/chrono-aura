const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        wishlistedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

wishListSchema.index({ user: 1 });

const WishListModel = mongoose.model("wishlist",wishListSchema);

module.exports = WishListModel;
