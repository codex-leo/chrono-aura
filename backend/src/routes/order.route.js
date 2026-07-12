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

// POST /request-return/:id
router.post("/request-return/:id",authMiddleware.authUser,orderController.requestOrderReturn);

// PUT /admin/return-requests/:id/approve
router.put("/admin/return-requests/:id/approve",authMiddleware.authAdmin,orderController.approveReturnRequest);

// PUT /admin/return-requests/:id/reject
router.put("/admin/return-requests/:id/reject",authMiddleware.authAdmin,orderController.rejectReturnRequest);

// PUT /admin/return-requests/:id/return-pickup
router.put("/admin/return-requests/:id/return-pickup",authMiddleware.authAdmin,orderController.returnPickup);

// PUT /admin/return-requests/:id/return-received
router.put("/admin/return-requests/:id/return-received",authMiddleware.authAdmin,orderController.returnReceived);

// PUT /admin/return-requests/:id/complete-return
router.put("/admin/return-requests/:id/complete-return",authMiddleware.authAdmin,orderController.completeReturn);

// GET /admin/return-requests/:limit (limit be any number or all);
router.get("/admin/return-requests/:limit",authMiddleware.authAdmin,orderController.getOrderReturnRequest);

// GET /:id
router.get("/:id",authMiddleware.authUser,orderController.getOrder);


module.exports = router;