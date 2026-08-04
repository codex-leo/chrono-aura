const brandModel = require("../models/brand.model");
const APIError = require("../utils/APIError.util");

const getBrands = async (req, res) => {
  try {
    const limit = req.params.limit;
    let brands;
    if (limit === "all") {
      brands = await brandModel.find();
    } else {
      brands = await brandModel.find().limit(limit);
    }

    res.status(200).json({
      message: "Brands fetched successfully.",
      brands: brands,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Due an unexpected error brands can't be fetched.",
    });
  }
};

const getBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const brand = await brandModel.findById(brandId);

    if (!brand) {
      throw new APIError(404, "Brand not found!");
    }

    res.status(200).json({
      message: "Brand fetched successfully.",
      brand: brand,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    res.status(500).json({
      message: "Due to an unexpected error brand can't be fetched.",
    });
  }
};

module.exports = {
  getBrands,
  getBrand,
};
