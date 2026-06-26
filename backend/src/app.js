const express = require("express");
const authRoutes = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const cors = require("cors")

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth",authRoutes); //prefix for auth routes /api/auth

app.use("/api/product",productRoutes); //prefix for product related routes /api/product

app.use("/api/cart",cartRoutes); //prefix for cart related routes /api/cart

module.exports = app;