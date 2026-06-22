const jwt = require("jsonwebtoken");

// for verifying if the user is admin or not
const authAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  /*
     header {
        Authorization : `Bearer ${accessToken}`
     }
  */

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "You're Unauthorized",
    });
  }

  const accessToken = authHeader.split(" ")[1]; // ["Bearer" , "accessToken"]

  if (!accessToken) {
    return res.status(401).json({
      message: "You're Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET,
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Your'e not permitted to use this resource.",
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Your'e not permitted to use this resource.",
    });
  }
};

// for verification of user
const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "You're Unauthorized",
    });
  }

  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      message: "You're Unauthorized",
    });
  }

  try {
    jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Your'e not permitted to use this resource.",
    });
  }
};

module.exports = { authAdmin, authUser };
