const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const router = express.Router();

// POST /create
router.post("/create",authMiddleware.authUser,orderController.createOrder);

// GET /:id 
router.get("/:id",authMiddleware.authUser,orderController.getOrder);

// GET /admin/orders/:limit (limit be any number or all); 
router.get("/admin/orders/:limit",authMiddleware.authAdmin,orderController.getOrders);

module.exports = router;