const express = require("express");
const validationRules = require("../middlewares/validation.middleware");
const authController = require("../controllers/auth.controller");
const authMiddleWare = require("../middlewares/auth.middleware");

const router = express.Router();


// POST /register
router.post("/register",validationRules.registerUserValidationRules,authController.registerUser);

//POST /login
router.post("/login",authController.loginUser);

//POST /refresh-token
router.post("/refresh-token",authController.refreshTokens)

//POST /logout
router.post("/logout",authMiddleWare.authUser,authController.logoutUser);


module.exports = router;
