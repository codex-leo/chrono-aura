const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const reviewModel = require("../models/review.model");
const storageService = require("../services/storage.service");
const APIError = require("../utils/APIError.util");

// logic for uploading a review of a product
const createReview = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;
    const { message, rating = 1 } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      throw new APIError(404, "Product not found.");
    }

    const order = await orderModel.findOne({
      user: userId,
      orderStatus: "delivered",
      "items.product": productId,
    });

    if (!order) {
      throw new APIError(400, "You only can submit review for a product you've purchased and received.");
    }

    const existingReview = await reviewModel.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      throw new APIError(400, "You have already reviewed this product.");
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
      throw new APIError(400, "Rating must be a number between 1 and 5.");
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error review can't be submitted.",
    });
  }
};

//logic for getting all reviews of product
const getReviews = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await productModel.findById(productId);

    if (!product) {
      throw new APIError(404, "Product not found.");
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);

    const skip = (page - 1) * limit;

    const reviews = await reviewModel
      .find({
        product: productId,
      })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(product.reviewCount / limit);

    res.status(200).json({
      message: "Reviews fetched successfully.",
      reviews: reviews,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      totalPages: totalPages,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error unable to fetch reviews.",
    });
  }
};

//logic for deleting a review
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      throw new APIError(404, "Review not found.");
    }

    if (userId !== review.user.toString()) {
      throw new APIError(403, "You're not permitted to use this resource.");
    }

    const product = await productModel.findById(review.product);

    if (!product) {
      throw new APIError(400, "Review can't be deleted because product is already deleted.");
    }

    const totalRating = product.averageRating * product.reviewCount;
    const newRating = totalRating - review.rating;

    product.reviewCount -= 1;
    if (product.reviewCount === 0) {
      product.averageRating = 0;
    } else {
      product.averageRating = Number(
        (newRating / product.reviewCount).toFixed(1),
      );
    }

    await review.deleteOne();
    await product.save();

    res.status(200).json({
      message: "Review Deleted Successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error unable to delete review.",
    });
  }
};

//logic for updating a review
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const { message, rating } = req.body;

    if (rating === undefined && message === undefined) {
      throw new APIError(400, "Nothing to update.");
    }

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      throw new APIError(404, "Review not found.");
    }

    if (review.user.toString() !== userId) {
      throw new APIError(403, "You're not permitted to use this resource.");
    }

    const product = await productModel.findById(review.product);

    if (!product) {
      throw new APIError(400, "Review can't be updated because product is already deleted.");
    }

    if (rating !== undefined) {
      const numRating = Number(rating);

      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        throw new APIError(400, "Rating must be a number between 1 and 5.");
      }

      const newTotalRating =
        product.averageRating * product.reviewCount - review.rating + numRating;

      const newAverageRating = newTotalRating / product.reviewCount;

      review.rating = numRating;

      product.averageRating = Number(newAverageRating.toFixed(1));
    }

    if (message !== undefined) {
      review.message = message;
    }

    await product.save();
    await review.save();

    res.status(200).json({
      message: "Review updated successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Due to an unexpected error unable to update review.",
    });
  }
};

// logic for getting my(current user) reviews
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const review = await reviewModel
      .find({
        user: userId,
      })
      .populate("product", "name brand thumbnailURI")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully.",
      review: review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Due an unexpected error, reviews can't be fetched.",
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  deleteReview,
  updateReview,
  getMyReviews,
};
