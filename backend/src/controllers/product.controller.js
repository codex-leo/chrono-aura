const brandModel = require("../models/brand.model");
const storageService = require("../services/storage.service");


const registerBrand = async(req,res) => {
    const file = req.file;
    const reqBody = req.body;
    
    const uploadResult = await storageService.uploadFile(file.buffer.toString("base64"),"brand");

    const brand = await brandModel.create({
        name : reqBody.name,
        logoURI : uploadResult.url,
        country : reqBody.country,
        descripion : reqBody.description
    });

    res.status(201).json({
        message : "Brand Register Successfully",
        brand : brand
    });
};

module.exports = { registerBrand };