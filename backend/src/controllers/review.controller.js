const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const reviewModel = require("../models/review.model");
const { uploadFile } = require("../services/storage.service");
const storageService = require("../services/storage.service");

const createReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const { message, rating = 1 } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const order = await orderModel.findOne({
      user: userId,
      orderStatus: "delivered",
      "items.product": productId,
    });

    if (!order) {
      return res.status(400).json({
        message:
          "You only can submit review for a product you've purchased and received.",
      });
    }

    const images = req.files?.images;

    let imagesURI = [];

    if (images && images.length > 0) {
      const uploadImagesPromises = images.map((image) =>
        storageService.uploadFile(image.buffer.toString("base64"), "review"),
      );

      const uploadImages = await Promise.all(uploadImagesPromises);

      imagesURI = uploadImages.map((image) => image.url);
    }

    const numRating = Number(rating);

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5.",
      });
    }

    const review = await reviewModel.create({
      user: userId,
      product: productId,
      images: imagesURI,
      message: message,
      rating: numRating,
    });

    const avgRating = product.averageRating;
    const reviewCount = product.reviewCount;
    const newAverageRating =
      (avgRating * reviewCount + numRating) / (reviewCount + 1);
    product.reviewCount = reviewCount + 1;
    product.averageRating = Number(newAverageRating.toFixed(1));

    await product.save();

    res.status(201).json({
      message: "Review submitted successfully.",
      review: review,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }
    res.status(500).json({
      message: "Due to an unexpected error review can't be submitted.",
    });
  }
};

module.exports = { createReview };
