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
        .populate("user", "username email role")
        .populate("items.product");
    } else {
      orders = await orderModel
        .find()
        .populate("user", "username email role")
        .populate("items.product")
        .limit(limit);
    }

    if (orders.length === 0) {
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

//logic for updating order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    let status = req.body.status;

    if (!status) {
      return res.status(400).json({
        message: "Order status is required",
      });
    }

    status = status.toLowerCase();

    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.orderStatus === status) {
      return res.status(200).json({
        message: "Order status is already updated with this status.",
      });
    }

    if (!orderUtils.isValidOrderStatusTransition(order.orderStatus, status)) {
      return res.status(400).json({
        message: "Invalid order status transition.",
      });
    }

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }
    order.orderStatus = status;
    order.statusHistory.push({
      status: status,
      changedAt: new Date(),
    });
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully.",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error can't update order status.",
    });
  }
};

//logic for for getting my(current user)orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const userOrders = await orderModel
      .find({
        user: userId,
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully.",
      orders: userOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error can't fetch orders.",
    });
  }
};

// logic for cancelling an order
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const cancellationReason = req.body.cancellationReason || "N/A";

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        message: "You are not allowed to use this resource.",
      });
    }

    if (
      order.orderStatus === "pending" ||
      order.orderStatus === "confirmed" ||
      order.orderStatus === "processing"
    ) {
      const now = new Date();
      order.orderStatus = "cancelled";
      order.cancelledAt = now;
      order.cancellationReason = cancellationReason;
      order.statusHistory.push({
        status: "cancelled",
        changedAt: now,
      });

      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.product, {
          $inc: {
            stock: item.quantity,
          },
        });
      }

      await order.save();
    } else if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Order is already cancelled.",
      });
    } else {
      return res.status(400).json({
        message: "You can't cancel order.",
      });
    }

    res.status(200).json({
      message: "Order cancelled successfully.",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error can not cancel order.",
    });
  }
};

//logic for requesting a return of whole order(including all items)
const requestOrderReturn = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const returnReason = req.body.returnReason || "N/A";

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        message: "You're not allowed to use this resource.",
      });
    }

    if (order.orderStatus === "waiting_for_return_approval") {
      return res.status(400).json({
        message:
          "Can't return your order as it already have a return request waiting for approval.",
      });
    }

    if (
      order.orderStatus === "delivered" &&
      order.payment.paymentStatus === "paid"
    ) {
      const returnDate = new Date(order.deliveredAt);
      returnDate.setDate(returnDate.getDate() + 7); //considering 7 days return policy
      const now = new Date();

      if (now <= returnDate) {
        order.orderStatus = "waiting_for_return_approval";
        order.statusHistory.push({
          status: "waiting_for_return_approval",
          changedAt: now,
        });
        order.return.initiatedAt = now;
        order.return.returnReason = returnReason;
        order.return.status = "pending";
        await order.save();
      } else {
        return res.status(400).json({
          message: "Order can't be returned as return date is expired.",
        });
      }
    } else {
      return res.status(400).json({
        message: "Order can't be returned.",
      });
    }

    res.status(200).json({
      message:
        "Order successfully set for return approval, and return process will start after approval.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Due an unexpected error order can't be returned.",
    });
  }
};

//logic for getting all orders which are waiting for return approval (admin)
const getOrderReturnRequest = async (req, res) => {
  try {
    const limit = req.params.limit;
    let orders;
    if (limit === "all") {
      orders = await orderModel
        .find({
          orderStatus: "waiting_for_return_approval",
        })
        .populate("user", "username email")
        .sort({ "return.initiatedAt": -1 });
    } else {
      orders = await orderModel
        .find({
          orderStatus: "waiting_for_return_approval",
        })
        .populate("user", "username email")
        .limit(limit)
        .sort({ "return.initiatedAt": -1 });
    }
    res.status(200).json({
      message: "Order return requests fetched successfully.",
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Due to an unexpected error, order return requests can't be fetched.",
    });
  }
};

//logic for approving return request (admin)
const approveReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.orderStatus === "waiting_for_return_approval" &&
      order.return.status === "pending"
    ) {
      const now = new Date();
      order.orderStatus = "return_confirmed";
      order.return.status = "approved";
      order.return.approvedAt = now;
      order.statusHistory.push({
        status: "return_confirmed",
        changedAt: now,
      });
      await order.save();
    } else {
      return res.status(400).json({
        message:
          "Unable to approve return as order is not waiting for return approval and return status is not pending.",
      });
    }

    res.status(200).json({
      message: "Return approved successfully.",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error return request can't be approved.",
    });
  }
};

//logic for rejecting return request (admin)
const rejectReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.orderStatus === "waiting_for_return_approval" &&
      order.return.status === "pending"
    ) {
      const now = new Date();
      order.orderStatus = "delivered";
      order.return.status = "rejected";
      order.return.rejectedAt = now;
      order.statusHistory.push({
        status: "delivered",
        changedAt: now,
      });
      await order.save();
    } else {
      return res.status(400).json({
        message:
          "Unable to reject return request as order is not waiting for return approval and return status is not pending.",
      });
    }

    res.status(200).json({
      message: "Return rejected successfully.",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error return request can't be rejected.",
    });
  }
};

//logic for processing return pickup (admin)
const returnPickup = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.return.status === "approved" &&
      order.orderStatus === "return_confirmed"
    ) {
      const now = new Date();
      order.return.status = "out_for_pickup";
      order.orderStatus = "return_processing";
      order.statusHistory.push({
        status: "return_processing",
        changedAt: now,
      });
      order.return.outForPickupAt = now;
      const estimatedPickupDate = new Date();
      estimatedPickupDate.setDate(estimatedPickupDate.getDate() + 4);
      order.return.estimatedPickup = estimatedPickupDate;
      await order.save();
    } else {
      return res.status(400).json({
        message:
          "Return order pickup can't be set, as order return request is not yet approved.",
      });
    }

    res.status(200).json({
      message: "Order return pickup set successfully.",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Due to an unexpected error return pickup request can't be fulfilled.",
    });
  }
};

//logic for processing return received (admin)
const returnReceived = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.return.status === "out_for_pickup" &&
      order.orderStatus === "return_processing"
    ) {
      const now = new Date();
      order.return.status = "order_received";
      order.return.receivedAt = now;
      order.statusHistory.push({
        status: "order_received",
        changedAt: now,
      });
      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.product, {
          $inc: {
            stock: item.quantity,
          },
        });
      }
      await order.save();
    } else {
      return res.status(400).json({
        message: "Return order can't be set to received.",
      });
    }

    res.status(200).json({
      message: "Order return received successfully.",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Due to an unexpected error return order pickup recieved request can't be fulfilled.",
    });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  requestOrderReturn,
  getOrderReturnRequest,
  approveReturnRequest,
  rejectReturnRequest,
  returnPickup,
  returnReceived,
};
