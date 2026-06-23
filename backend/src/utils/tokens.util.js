const jwt = require("jsonwebtoken");

//function for generating tokens
const generateRefreshToken = (payload) => {
  //creating refresh token
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return refreshToken;
};

const generateAccessToken = (payload) => {
  //creating access token
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  return accessToken;
};

module.exports = { generateRefreshToken, generateAccessToken };
