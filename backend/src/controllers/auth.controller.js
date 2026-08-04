const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cartModel = require("../models/cart.model");
const tokensUtil = require("../utils/tokens.util");
const sessionModel = require("../models/session.model");
const crypto = require("node:crypto");
const wishlistModel = require("../models/wishlist.model");
const APIError = require("../utils/APIError.util");

//logic to register an user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      throw new APIError(409, "User already exists.");
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

    //generating empty cart and wishlist for user
    if (user.role !== "admin") {
      const cart = await cartModel.create({ user: user._id });
      user.cart = cart._id;
      const wishlist = await wishlistModel.create({ user: user._id });
      user.wishlist = wishlist._id;
      await user.save();
    }

    //generating access and refresh tokens for user
    const payload = {
      id: user._id,
      role: user.role,
    };

    const refreshToken = tokensUtil.generateRefreshToken(payload);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    //creating session for user
    const session = await sessionModel.create({
      user: user._id,
      userAgent: req.headers["user-agent"],
      userIP: req.ip,
      refreshTokenHash: refreshTokenHash,
    });

    const accessToken = tokensUtil.generateAccessToken({
      id: user._id,
      role: user.role,
      sessionId: session._id,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(201).json({
      message: "User registered successfully.",
      accessToken: accessToken,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due an unexpected error user cannot be registered.",
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
      throw new APIError(401, "Your'e not authorised");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new APIError(401, "Invalid credentials.");
    }

    //generating access and refresh tokens for user
    const payload = {
      id: user._id,
      role: user.role,
    };

    const refreshToken = tokensUtil.generateRefreshToken(payload);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    //creating session for user
    const session = await sessionModel.create({
      user: user._id,
      userAgent: req.headers["user-agent"],
      userIP: req.ip,
      refreshTokenHash: refreshTokenHash,
    });

    const accessToken = tokensUtil.generateAccessToken({
      id: user._id,
      role: user.role,
      sessionId: session._id,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    const userTosend = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      cart: user.cart,
    };

    res.status(200).json({
      message: "User logged in successfully.",
      accessToken: accessToken,
      user: userTosend,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error user cannot be logged in.",
    });
  }
};

const refreshTokens = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new APIError(403, "Refresh token not found.");
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash: refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      throw new APIError(401, "Session not found or revoked.");
    }

    const newAccessToken = tokensUtil.generateAccessToken({
      id: decoded.id,
      role: decoded.role,
      sessionId: session._id,
    });

    const newRefreshToken = tokensUtil.generateRefreshToken({
      id: decoded.id,
      role: decoded.role,
    });

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "strict",
      httpOnly: true,
    });

    res.status(200).json({
      message: "Token Refreshed successfully.",
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error tokens can't be refreshed.",
    });
  }
};

//logic for logging out user
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new APIError(400, "Refresh token not found.");
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash: refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      throw new APIError(400, "Session not found or already revoked.");
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error user can't be logged out.",
    });
  }
};

// logic for logout from all devices
const logoutAll = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new APIError(400, "Refresh token not found.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );

    await sessionModel.updateMany(
      { user: decoded.id, revoked: false },
      { revoked: true },
    );

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out from all devices successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message:
        "Due to an unexpected error user can't logged out from all devices.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  logoutAll,
};
