const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

const router = express.Router();

// POST /add-to-cart
router.put("/add-to-cart/:cartId",authMiddleware.authUser,cartController.addToCart);

module.exports = router;