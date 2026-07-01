const express = require("express");
const authMiddleWare = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

// GET /me
router.get("/me",authMiddleWare.authUser,userController.getMe);

// GET /users/:limit or /all-users/all
router.get("/users/:limit",authMiddleWare.authAdmin,userController.getAllUsers)

//GET /:id 
router.get("/:id",authMiddleWare.authAdmin,userController.getUser);

module.exports = router;