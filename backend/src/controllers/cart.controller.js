const cartModel = require("../models/cart.model");

//logic for adding into cart
const addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newProductObj = req.body.product;

    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    cart.products.push(newProductObj);
    await cart.save();

    res.status(200).json({
      message: "Added to cart successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Due an unexpected error cart can't be updated.",
    });
  }
};

//logic for updating items into cart
const updateCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cart = await cartModel.findOneAndUpdate({ user: userId }, req.body, {
      returnDocument: "after",
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    res.status(200).json({
      message: "Cart Updated Succesfully.",
      cart: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Due an unexpected error cart can't be updated.",
    });
  }
};

//logic for getting cart information
const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cart = await cartModel
      .findOne({
        user: userId,
      })
      .populate("products.product", "name brand price");
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    res.status(200).json({
      message: "Cart feteched successfully.",
      cart: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Due an unexpected error cart can't be updated.",
    });
  }
};

module.exports = { updateCart, getCart, addToCart };
