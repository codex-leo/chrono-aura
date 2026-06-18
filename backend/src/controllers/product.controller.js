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

module.exports = { registerBrand, registerProduct };