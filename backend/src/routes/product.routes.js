const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const productController = require("../controllers/product.controller");
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

// GET /products/:limit
router.get("/products/:limit",authMiddleware.authUser,productController.getProducts);

// GET /product/:id
router.get("/:id",authMiddleware.authUser,productController.getProduct);

module.exports = router;
