const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
    message: String,
    rating: {
      type: Number,
      required : true,
      min: 1,
      max: 5,
    },
    images: [String],
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const ReviewModel = mongoose.model("review", reviewSchema);

module.exports = ReviewModel;
