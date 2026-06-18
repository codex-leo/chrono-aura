const jwt = require("jsonwebtoken");

// for verifying if the user is admin or not
const authAdmin = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Your'e not permitted to use this resource.",
      });
    }

    next();
  } catch (err) {
    return res.status(403).json({
      message: "Your'e not permitted to use this resource.",
    });
  }
};

module.exports = { authAdmin };
