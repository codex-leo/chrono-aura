const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const wishlistController = require("../controllers/wishlist.controller");

const router = express.Router();

// POST /:productId
router.post("/:productId",authMiddleware.authUser,wishlistController.addToWishlist);

// DELETE /:productId
router.delete("/:productId",authMiddleware.authUser,wishlistController.removeFromWishList);

// GET /my-wishlist
router.get("/my-wishlist",authMiddleware.authUser,wishlistController.getWishList);

module.exports = router;