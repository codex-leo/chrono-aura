const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const router = express.Router();

// GET /create
router.post("/create",authMiddleware.authUser,orderController.createOrder);

module.exports = router;