const productModel = require("../models/product.model");
const userModel = require("../models/user.model");
const brandModel = require("../models/brand.model");

// logic for getting low stock products
const lowStock = async (req, res) => {
  const minStockLimit = 10; // if stock < minStockLimit then we consider that as low stock

  try {
    const products = await productModel.find({
      stock: { $lt: minStockLimit },
    });

    if (products.length === 0) {
      return res.status(200).json({
        message: "There are no low stock products.",
      });
    }

    res.status(200).json({
      message: "Fetched low stock products successfully.",
      LowStockProducts: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Due to an unexpected error, unable to process your request.",
    });
  }
};

//logic for getting stats
const getStats = async (req, res) => {
  try {
    const productsListed = await productModel.countDocuments({});
    const users = await userModel.countDocuments({});
    const brandsListed = await brandModel.countDocuments({});

    res.status(200).json({
        message : "Stats fetched successfully.",
        stats : {
            totalUsers : users,
            brandsListed : brandsListed,
            productsListed : productsListed
        }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Due to an unexpected error, unable to process your request.",
    });
  }
};

module.exports = { lowStock, getStats };
