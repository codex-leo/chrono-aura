const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

//logic for fetching current logged in user
const getMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    const user = await userModel.findOne(
      {
        _id: decoded.id,
      },
      "-password",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully.",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error can not to get user detail.",
    });
  }
};

// logic for fetching details of all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const limit = req.params.limit;
    let users;
    // GET api/user/users/all
    if (limit === "all") {
      users = await userModel.find({}, "-password");
    } else {
      // GET api/user/users/:limit
      users = await userModel.find({}, "-password").limit(limit);
    }

    res.status(200).json({
      message: "Users fetched successfully.",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error can not fetch all users",
    });
  }
};

//logic to get user by using their id (admin only)
const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id, "-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "User fetched successfully.",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error can not fetch user details",
    });
  }
};

module.exports = { getMe, getAllUsers, getUser };
