const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const productController = require("../controllers/product.controller");
const multer = require("multer");

const upload = multer({storage: multer.memoryStorage()});

const router = express.Router();


// POST /register-brand
router.post("/register-brand",authMiddleware.authAdmin,upload.single("logo"),productController.registerBrand);


module.exports = router;