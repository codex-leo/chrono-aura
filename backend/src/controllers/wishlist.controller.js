const wishlistModel = require("../models/wishlist.model");
const productModel = require("../models/product.model");

// logic for adding into wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const wishlist = await wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found.",
      });
    }

    for (const productItem of wishlist.products) {
      if (productItem.product.toString() === productId) {
        return res.status(400).json({
          message: "Product already exists in wishlist.",
        });
      }
    }

    const wishlistObj = {
      product: productId,
      wishlistedAt: new Date(),
    };

    wishlist.products.push(wishlistObj);

    await wishlist.save();

    res.status(201).json({
      message: "Product wishlisted successfully.",
      wishlist: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error, unable to add to wishlist.",
    });
  }
};

module.exports = { addToWishlist };
