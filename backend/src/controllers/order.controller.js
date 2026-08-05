const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const orderUtils = require("../utils/order.util");
const APIError = require("../utils/APIError.util");

//logic for creating an order
const createOrder = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    const { items, shippingAddress, payment, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new APIError(400, "Order must contain at least one item.");
    }

    const productIds = items.map((item) => item.product);

    const products = await productModel
      .find({
        _id: { $in: productIds },
      })
      .populate("brand", "name");

    if (products.length !== productIds.length) {
      throw new APIError(404, "One or more products were not found.");
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
        throw new APIError(404, "Product not found.");
      }

      if (item.quantity <= 0) {
        throw new APIError(400, `Invalid quantity for ${product.name}.`);
      }

      if (item.quantity > product.stock) {
        throw new APIError(
          400,
          `${product.name} has only ${product.stock} units available.`,
        );
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

    let order = null;

    await session.withTransaction(async () => {
      [order] = await orderModel.create(
        [
          {
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
          },
        ],
        { session },
      );

      for (const item of items) {
        await productModel.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          { session },
        );
      }
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error your order can't be placed.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

//logic for getting order by id
const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await orderModel.findById(orderId);

    if (!order) {
      throw new APIError(404, "Order not found.");
    }

    if (userId !== order.user.toString()) {
      throw new APIError(403, "You're not allowed to use this resource.");
    }

    res.status(200).json({
      message: "Order fetched successfully.",
      order: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
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
    return res.status(500).json({
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
      throw new APIError(400, "Order status is required.");
    }

    status = status.toLowerCase();

    const order = await orderModel.findById(id);

    if (!order) {
      throw new APIError(404, "Order not found.");
    }

    if (order.orderStatus === status) {
      throw new APIError(
        400,
        "Order status is already updated with this status.",
      );
    }

    if (!orderUtils.isValidOrderStatusTransition(order.orderStatus, status)) {
      throw new APIError(400, "Invalid order status transition.");
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
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
    return res.status(500).json({
      message: "Due to an unexpected error can't fetch orders.",
    });
  }
};

// logic for cancelling an order
const cancelOrder = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    const userId = req.user.id;
    const orderId = req.params.id;
    const cancellationReason = req.body.cancellationReason || "N/A";

    let updatedOrder;
    const cancellableStatuses = ["pending", "confirmed", "processing"];

    await session.withTransaction(async () => {
      const order = await orderModel.findById(orderId).session(session);

      if (!order) {
        throw new APIError(404, "Order not found.");
      }

      if (order.user.toString() !== userId) {
        throw new APIError(403, "You are not allowed to use this resource.");
      }

      if (order.orderStatus === "cancelled") {
        throw new APIError(400, "Order is already cancelled.");
      }

      if (!cancellableStatuses.includes(order.orderStatus)) {
        throw new APIError(400, "You can't cancel this order.");
      }

      const now = new Date();
      order.orderStatus = "cancelled";
      order.cancelledAt = now;
      order.cancellationReason = cancellationReason;
      order.statusHistory.push({
        status: "cancelled",
        changedAt: now,
      });

      for (const item of order.items) {
        await productModel.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session },
        );
      }
      await order.save({ session });
      updatedOrder = order;
    });

    return res.status(200).json({
      message: "Order cancelled successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Due to an unexpected error can not cancel order.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
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
      throw new APIError(404, "Order not found.");
    }

    if (order.user.toString() !== userId) {
      throw new APIError(403, "You're not allowed to use this resource.");
    }

    if (order.orderStatus === "waiting_for_return_approval") {
      throw new APIError(
        400,
        "Can't return your order as it already have a return request waiting for approval.",
      );
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
        throw new APIError(
          400,
          "Order can't be returned as return date is expired.",
        );
      }
    } else {
      throw new APIError(400, "Order can't be returned.");
    }

    res.status(200).json({
      message:
        "Order successfully set for return approval, and return process will start after approval.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
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
    return res.status(500).json({
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
      throw new APIError(404, "Order not found.");
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
      throw new APIError(
        400,
        "Unable to approve return as order is not waiting for return approval and return status is not pending.",
      );
    }

    res.status(200).json({
      message: "Return approved successfully.",
      order: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
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
      throw new APIError(404, "Order not found.");
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
      throw new APIError(
        400,
        "Unable to reject return request as order is not waiting for return approval and return status is not pending.",
      );
    }

    res.status(200).json({
      message: "Return rejected successfully.",
      order: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
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
      throw new APIError(404, "Order not found.");
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
      throw new APIError(
        400,
        "Return order pickup can't be set, as order return request is not yet approved.",
      );
    }

    res.status(200).json({
      message: "Order return pickup set successfully.",
      order: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message:
        "Due to an unexpected error return pickup request can't be fulfilled.",
    });
  }
};

//logic for processing return received (admin)
const returnReceived = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    const orderId = req.params.id;
    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await orderModel.findById(orderId).session(session);

      if (!order) {
        throw new APIError(404, "Order not found.");
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
          await productModel.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock: item.quantity,
              },
            },
            { session },
          );
          if (!product) {
            throw new APIError(404, "Product not found.");
          }
        }
        await order.save({ session });
        updatedOrder = order;
      } else {
        throw new APIError(400, "Return order can't be set to received.");
      }
    });

    res.status(200).json({
      message: "Order return received successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message:
        "Due to an unexpected error return order pickup received request can't be fulfilled.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

//logic for completing order return process (admin)
const completeReturn = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await orderModel.findById(orderId);

    if (!order) {
      throw new APIError(404, "Order not found.");
    }

    if (
      order.orderStatus === "return_processing" &&
      order.return.status === "order_received"
    ) {
      const now = new Date();
      order.orderStatus = "returned";
      order.returnedAt = now;
      order.return.status = "completed";
      order.payment.paymentStatus = "refunded";
      order.payment.refundedAt = now;
      order.statusHistory.push({
        status: "returned",
        changedAt: now,
      });
      await order.save();
    } else {
      throw new APIError(
        400,
        "Order return complete request can't be fulfilled.",
      );
    }

    res.status(200).json({
      message: "Order return completed successfully.",
      order: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message:
        "Due an unexpected error order return complete request can't be fulfilled.",
    });
  }
};

//logic for getting order by id (admin)
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await orderModel
      .findById(orderId)
      .populate("user", "username email");

    if (!order) {
      throw new APIError(404, "Order not found.");
    }

    res.status(200).json({
      message: "Order fetched successfully.",
      order: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due an unexpected error unable to fetch order.",
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
  completeReturn,
  getOrderById,
};
