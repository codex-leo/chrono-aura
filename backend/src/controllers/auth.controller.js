const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//logic to register an user
const registerUser = async (req, res) => {
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

  //generating token for user
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User registered successfully.",
  });
};

//logic for logging in an user
const loginUser = async (req, res) => {
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

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
  );

  res.cookie("token", token);

  res.status(200).json({
    message: "Login Successfull!",
  });
};

module.exports = { registerUser, loginUser };
