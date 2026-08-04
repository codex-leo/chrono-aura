const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const APIError = require("../utils/APIError.util");

//logic for adding into cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.body.product) {
      throw new APIError(400, "Product data is required.");
    }

    const newProductObj = req.body.product;

    if (!newProductObj.productId) {
      throw new APIError(400, "Product Id not found in request.");
    }

    const product = await productModel.findById(newProductObj.productId);

    if (!product) {
      throw new APIError(404, "Product not found.");
    }

    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      throw new APIError(404, "Cart not found.");
    }

    let quantity;

    if (newProductObj.quantity === undefined) {
      quantity = 1;
    } else {
      const numQuantity = Number(newProductObj.quantity);
      if (isNaN(numQuantity)) {
        throw new APIError(400, "Quantity must be a valid number.");
      } 
      else if (numQuantity <= 0) {
        throw new APIError(400, "Quantity must be greater than zero.");
      } 
      else {
        quantity = numQuantity;
      }
    }

    for (const productItem of cart.products) {
      if (newProductObj.productId === productItem.product.toString()) {
        if (quantity + productItem.quantity > product.stock) {
          throw new APIError(400, "Quantity exceeded product stock.");
        }
        productItem.quantity += quantity;
        await cart.save();
        return res.status(200).json({
          message: "Added to cart successfully.",
        });
      }
    }

    if (quantity > product.stock) {
      throw new APIError(400, "Quantity exceeded product stock.");
    }

    cart.products.push({
      product: newProductObj.productId,
      quantity: quantity,
    });
    await cart.save();

    res.status(200).json({
      message: "Added to cart successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due an unexpected error unable to add to cart.",
    });
  }
};

//logic for updating items into cart (only updating quantity)
const updateCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;
    const quantity = req.body.quantity;

    const product = await productModel.findById(productId);

    if (!product) {
      throw new APIError(404, "Product not found.");
    }

    const cart = await cartModel.findOne({
      user: userId,
      "products.product": productId,
    });

    if (!cart) {
      throw new APIError(404, "Cart not found.");
    }

    let numQuantity = Number(quantity);

    if (isNaN(numQuantity)) {
      throw new APIError(400, "Quantity must be a valid number.");
    } 
    else if (!Number.isInteger(numQuantity)) {
      throw new APIError(400, "Quantity must be an integer.");
    } 
    else if (numQuantity <= 0) {
      throw new APIError(400, "Quantity can't be changed to zero or negative.");
    } 
    else if (numQuantity > product.stock) {
      throw new APIError(400, "Requested quantity exceeds available stock.");
    }

    for (const productItem of cart.products) {
      if (productId === productItem.product.toString()) {
        productItem.quantity = numQuantity;
        await cart.save();
        return res.status(200).json({
          message: "Cart item updated successfully.",
          cart: cart,
        });
      }
    }

    throw new APIError(400, "Product not found in cart.");
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due an unexpected error cart can't be updated.",
    });
  }
};

//logic for getting cart information
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await cartModel
      .findOne({
        user: userId,
      })
      .populate("products.product", "name brand price");

    if (!cart) {
      throw new APIError(404, "Cart not found.");
    }

    res.status(200).json({
      message: "Cart feteched successfully.",
      cart: cart,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due an unexpected error cart can't be fetched.",
    });
  }
};

//logic for clearing cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      throw new APIError(404, "Cart not found.");
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due an unexpected error cart can't be cleared.",
    });
  }
};

//logic for deleting a product from cart
const removeProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const cart = await cartModel.findOne({
      user: userId,
      "products.product": productId,
    });

    if (!cart) {
      throw new APIError(404, "Cart not found.");
    }

    if (cart.products.length === 0) {
      throw new APIError(400, "Cart is already empty.");
    }

    for (let i = 0; i < cart.products.length; i++) {
      const productObj = cart.products[i];
      if (productObj.product.toString() === productId) {
        cart.products.splice(i, 1);
        await cart.save();
        return res.status(200).json({
          message: "Removed from cart successfully.",
        });
      }
    }

    throw new APIError(404, "Product not found in cart.");
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due an unexpected error unable to remove product from cart.",
    });
  }
};

module.exports = {
  updateCart,
  getCart,
  addToCart,
  clearCart,
  removeProduct,
};
