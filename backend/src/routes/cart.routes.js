const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

const router = express.Router();


// POST /add-to-cart
router.post("/add-to-cart",authMiddleware.authUser,cartController.addToCart);

// PATCH /update-cart/:productId
router.patch("/update-cart/:productId",authMiddleware.authUser,cartController.updateCart);

// GET /cart/my-cart
router.get("/my-cart",authMiddleware.authUser,cartController.getCart);

//DELETE /cart/my-cart/clear-cart
router.delete("/my-cart/clear-cart",authMiddleware.authUser,cartController.clearCart);

// DELETE /cart/my-cart/:productId
router.delete("/my-cart/:productId",authMiddleware.authUser,cartController.removeProduct);

module.exports = router;