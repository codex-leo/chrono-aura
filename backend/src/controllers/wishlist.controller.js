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

// logic for removing a product from wishlist
const removeFromWishList = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const wishlist = await wishlistModel.findOne({
      user: userId,
      "products.product": productId,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found.",
      });
    }

    for (let i = 0; i < wishlist.products.length; i++) {
      if (productId === wishlist.products[i].product.toString()) {
        wishlist.products.splice(i, 1);
        await wishlist.save();
        return res.status(200).json({
          message: "Product removed from wishlist successfully.",
        });
      }
    }

    res.status(404).json({
      message: "Product not found in wishlist.",
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Due to an unexpected error unable to remove a product from wishlist.",
    });
  }
};

// logic for getting user's wishlist
const getWishList = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await wishlistModel.findOne({ user: userId }).populate({
      path: "products.product",
      select: "name price brand",
      populate: {
        path: "brand",
        select: "name",
      },
    });
    
    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found.",
      });
    }

    res.status(200).json({
      message: "Wishlist fetched successfully.",
      wishlist: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error unable to fetch wishlist.",
    });
  }
};

module.exports = { addToWishlist, removeFromWishList, getWishList };
