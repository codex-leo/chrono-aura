const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const productController = require("../controllers/product.controller");
const reviewController = require("../controllers/review.controller");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// POST /register-brand
router.post("/register-brand",authMiddleware.authAdmin,upload.single("logo"),productController.registerBrand);

// POST /register-product
router.post(
  "/register-product",authMiddleware.authAdmin,
  upload.fields([
    { name: "thumbnailImage", maxCount: 1 },
    { name: "images", maxCount: 5 },]),
    productController.registerProduct
);

// GET /products/:limit (limit can be any number or a string "all")
router.get("/products/:limit",authMiddleware.authUser,productController.getProducts);

// GET /product/:id
router.get("/:id",authMiddleware.authUser,productController.getProduct);

// PUT /product/:id
router.put("/:id",authMiddleware.authAdmin,productController.updateProduct);

// GET /product/sample/products
router.get("/sample/products",productController.getSampleProducts);

// POST /:id/reviews
router.post("/:productId/reviews",authMiddleware.authUser,
  upload.fields([
  {name : "images", maxCount : 5}]),
  reviewController.createReview
);

// GET /:id/reviews (query supported for pagination)
//example : GET /344732/reviews?page=1&limit=10
router.get("/:productId/reviews",authMiddleware.authUser,reviewController.getReviews);

// DELETE /:id/reviews
router.delete("/:id/reviews",authMiddleware.authUser,reviewController.deleteReview);

// PATCH /:id/reviews
router.patch("/:id/reviews",authMiddleware.authUser,reviewController.updateReview);

module.exports = router;
