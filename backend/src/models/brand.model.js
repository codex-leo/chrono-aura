const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    logoURI: {
      type: String,
      required: true,
    },
    country: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const BrandModel = mongoose.model("brand", brandSchema);

module.exports = BrandModel;