const express = require("express");
const validationRules = require("../middlewares/validation.middleware");
const authController = require("../controllers/auth.controller");

const router = express.Router();


// POST /register
router.post("/register",validationRules.registerUserValidationRules,authController.registerUser);

//POST /login
router.post("/login",authController.loginUser);

//POST /refresh-token
router.post("/refresh-token",authController.refreshToken)


module.exports = router;
