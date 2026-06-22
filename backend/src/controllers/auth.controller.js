const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cartModel = require("../models/cart.model");
const tokensUtil = require("../utils/tokens.util");

//logic to register an user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    //salt to be added in hashed password
    const salt = await bcrypt.genSalt(10);

    //generating hashed password
    const HashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      username: username,
      email: email,
      password: HashedPassword,
      role: role,
    });

    //generating cart of user
    if (user.role !== "admin") {
      const cart = await cartModel.create({ user: user._id });
      user.cart = cart._id;
      await user.save();
    }

    //generating access and refresh tokens for user
    const payload = {
      id: user._id,
      role: user.role,
    };

    const tokens = tokensUtil.generateTokens(payload);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Due an unexpected error user cannot be registered.",
      accessToken: tokens.accessToken,
    });
  }
};

//logic for logging in an user
const loginUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res.status(401).json({
        message: "Your'e not authorised",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    //generating access token and refresh token for user
    const payload = {
      id: user._id,
      role: user.role,
    };

    const tokens = tokensUtil.generateTokens(payload);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login Successfull!",
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error user cannot be logged in.",
    });
  }
};

const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({
      message: "Refresh token not found.",
    });
  }
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );

    const tokens = tokensUtil.generateTokens({
      id: decoded.id,
      role: decoded.role,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "strict",
      httpOnly: true,
    });

    res.status(200).json({
      message: "Token Refreshed successfully.",
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { registerUser, loginUser, refreshToken };
