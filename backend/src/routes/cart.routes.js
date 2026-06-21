const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

const router = express.Router();


// POST /add-to-cart
router.post("/add-to-cart/:userId",authMiddleware.authUser,cartController.addToCart)

// PUT /update-cart
router.put("/update-cart/:userId",authMiddleware.authUser,cartController.updateCart);

// GET /cart/:userId
router.get("/:userId",authMiddleware.authUser,cartController.getCart);

//DELETE /cart/:userId/clear-cart
router.delete("/:userId/clear-cart",authMiddleware.authUser,cartController.clearCart);

// DELETE /cart/:userId/:productId
router.delete("/:userId/:productId",authMiddleware.authUser,cartController.removeProduct);

module.exports = router;