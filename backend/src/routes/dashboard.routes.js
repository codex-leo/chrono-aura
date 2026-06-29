const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

const router = express.Router();

// GET /low-stock
router.get("/low-stock",authMiddleware.authAdmin,dashboardController.lowStock);

router.get("/stats",authMiddleware.authAdmin,dashboardController.getStats);

module.exports = router;