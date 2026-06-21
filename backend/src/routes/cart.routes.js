const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

const router = express.Router();


// POST /add-to-cart
router.post("/add-to-cart/:userId",authMiddleware.authUser,cartController.addToCart)

// PUT /update-cart
router.put("/update-cart/:userId",authMiddleware.authUser,cartController.updateCart);

// GET /cart/:id
router.get("/:userId",authMiddleware.authUser,cartController.getCart);

module.exports = router;