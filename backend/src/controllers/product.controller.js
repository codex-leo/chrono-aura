const brandModel = require("../models/brand.model");
const productModel = require("../models/product.model");
const mongoose = require("mongoose");
const storageService = require("../services/storage.service");

//logic to register a brand(only accessed by admin)
const registerBrand = async (req, res) => {
  try {
    const file = req.file;
    const reqBody = req.body;

    const uploadResult = await storageService.uploadFile(
      file.buffer.toString("base64"),
      "brand",
    );

    const brand = await brandModel.create({
      name: reqBody.name,
      logoURI: uploadResult.url,
      country: reqBody.country,
      description: reqBody.description,
    });

    return res.status(201).json({
      message: "Brand Register Successfully",
      brand: brand,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed due to an unexpected error.",
    });
  }
};

//logic to register a product(only accessed by admin)
const registerProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      tags = "watch",
      price,
      stock,
      productionYear,
      caseMaterial,
      caseDiameter,
    } = req.body;

    const isBrandRegistered = await brandModel.findOne({
      name: brand,
    });

    //admin needs to register brand before product
    if (!isBrandRegistered) {
      return res.status(409).json({
        message: "Brand is not registered",
      });
    }

    const { thumbnailImage, images } = req.files;

    // sequential manner to upload images
    //   if (images && images.length > 0) {
    //     for (let i = 0; i < images.length; i++) {
    //       const result = await storageService.uploadFile(
    //         images[i].buffer.toString("base64"),
    //       );
    //       imagesURI.push(result.url);
    //     }
    //   }

    let imagesURI;

    /*uploaded product images concurrently to reduce upload time
  as compared to sequential manner */

    if (images && images.length > 0) {
      const uploadImagesPromises = images.map((image) =>
        storageService.uploadFile(image.buffer.toString("base64")),
      );

      const uploadImages = await Promise.all(uploadImagesPromises);

      imagesURI = uploadImages.map((image) => image.url);
    }

    const result = await storageService.uploadFile(
      thumbnailImage[0].buffer.toString("base64"),
    );

    const product = await productModel.create({
      name: name,
      description: description,
      brand: isBrandRegistered._id,
      tags: tags.split(","),
      thumbnailURI: result.url,
      imagesURI: imagesURI,
      price: mongoose.Types.Decimal128.fromString(price),
      stock: stock,
      productionYear: productionYear,
      caseMaterial: caseMaterial,
      caseDiameter: caseDiameter,
    });

    res.status(201).json({
      message: "Product Registered Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed due to an unexpected error.",
    });
  }
};

//logic for getting all products
const getProducts = async (req, res) => {
  try {
    const limit = req.params.limit;
    let products;

    // GET api/product/products/all
    if (limit === "all") {
      products = await productModel
        .find({}, "name thumbnailURI stock price")
        .populate("brand", "name");
    } else {
      // GET api/product/products/:limit
      products = await productModel
        .find({}, "name thumbnailURI stock price")
        .limit(limit)
        .populate("brand", "name");
    }

    res.status(200).json({
      message: "Fetched Products Successfully.",
      products: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch products due to an unexpected error.",
    });
  }
};

//logic for getting a specific product information
const getProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await productModel.findById(id).populate("brand");

    res.status(200).json({
      message: "Product information fetched successfully.",
      product: product,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Unable to fetch product information due to an unexpexted error.",
    });
  }
};

//logic for updating a product(admin only)
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await productModel.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json({
      message: "Product updated successfully.",
      updatedProduct: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Due to an unexpected error product can't be updated.",
    });
  }
};

module.exports = {
  registerBrand,
  registerProduct,
  getProducts,
  getProduct,
  updateProduct,
};