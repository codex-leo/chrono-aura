const cartModel = require("../models/cart.model");

const addToCart = async (req, res) => {
  try {
    const cartId = req.params.cartId;

    const cart = await cartModel.findByIdAndUpdate(cartId, req.body, {
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
    res.status(500).json({
      message: "Due an unexpected error cart can't be updated.",
    });
  }
};

module.exports = { addToCart };
