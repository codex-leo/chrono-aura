const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const wishlistController = require("../controllers/wishlist.controller");

const router = express.Router();

// POST /:productId
router.post("/:productId",authMiddleware.authUser,wishlistController.addToWishlist);

module.exports = router;