const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const brandController = require("../controllers/brands.controller");

const router = express.Router();

// GET /:limit   (limit can be any number or a string "all")
router.get("/:limit",authMiddleware.authUser,brandController.getBrands);

// GET /:id 
router.get("/brand/:id",authMiddleware.authUser,brandController.getBrand);

module.exports = router;