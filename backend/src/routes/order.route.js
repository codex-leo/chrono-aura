const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const router = express.Router();

// POST /create
router.post("/create",authMiddleware.authUser,orderController.createOrder);

// GET /admin/orders/:limit (limit be any number or all); 
router.get("/admin/orders/:limit",authMiddleware.authAdmin,orderController.getOrders);

// PATCH /admin/order-status/:id 
router.patch("/admin/order-status/:id",authMiddleware.authAdmin,orderController.updateOrderStatus);

// GET /my-orders
router.get("/my-orders",authMiddleware.authUser,orderController.getMyOrders);

// POST /cancel/:id
router.post("/cancel/:id",authMiddleware.authUser,orderController.cancelOrder);

// GET /:id 
router.get("/:id",authMiddleware.authUser,orderController.getOrder);


module.exports = router;