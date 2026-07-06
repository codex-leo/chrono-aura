const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const orderUtils = require("../utils/order.util");

//logic for creating an order
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, payment, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item.",
      });
    }

    const productIds = items.map((item) => item.product);

    const products = await productModel
      .find({
        _id: { $in: productIds },
      })
      .populate("brand", "name");

    if (products.length !== productIds.length) {
      return res.status(404).json({
        message: "One or more products were not found.",
      });
    }

    const productMap = new Map();

    products.forEach((product) => {
      productMap.set(product._id.toString(), product);
    });

    const orderItems = [];
    let subTotal = 0;

    for (const item of items) {
      const product = productMap.get(item.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} units available.`,
        });
      }

      const productPrice = Number(product.price.toString());

      const itemSubTotal = productPrice * item.quantity;

      subTotal += itemSubTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        brand: product.brand.name,
        quantity: item.quantity,
        price: productPrice,
        subTotal: itemSubTotal,
      });
    }

    const discount = 0;
    const shippingFee = 100; //hard coded will be changed in future
    const tax = subTotal * 0.05; //5% tax
    const total = subTotal - discount + shippingFee + tax;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const order = await orderModel.create({
      user: req.user.id,
      orderNumber: orderUtils.generateOrderNumber(),
      items: orderItems,
      pricing: {
        subTotal,
        discount,
        shippingFee,
        tax,
        total,
      },
      shippingAddress,
      payment: {
        method: payment?.method || "cod",
        paymentStatus: "pending",
      },
      orderStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
        },
      ],
      estimatedDelivery,
      notes,
    });

    for (const item of items) {
      await productModel.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Due to an unexpected error your order can't be placed.",
    });
  }
};

//logic for getting order by id
const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (userId !== order.user.toString()) {
      return res.status(403).json({
        message: "You're not allowed to use this resource.",
      });
    }

    res.status(200).json({
      message: "Order fetched successfully.",
      order: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Due to an unexpected error can't fetch order.",
    });
  }
};

//logic for getting orders (admin)
const getOrders = async (req, res) => {
  try {
    const limit = req.params.limit || "all";
    let orders;

    if (limit.toLowerCase() === "all") {
      orders = await orderModel
        .find()
        .populate("user","username email role")
        .populate("items.product");
    } else {
      orders = await orderModel
        .find()
        .populate("user","username email role")
        .populate("items.product")
        .limit(limit);
    }

    if(orders.length === 0) {
      return res.status(200).json({
        message: "No orders listed right now.",
      });
    }

    res.status(200).json({
      message: "Orders fetched successfully.",
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error can't fetch orders.",
    });
  }
};

module.exports = { createOrder, getOrder, getOrders };
