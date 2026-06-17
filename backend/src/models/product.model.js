const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    brandName : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "brand"
    },
    tags : [{
        type : String
    }],
    imageURI : {
        type : String,
        required : true
    },
    productionYear : {
        type : String
    },
    price : {
        type : mongoose.Schema.Types.Decimal128,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    caseMaterial : {
        type : String
    },
    caseDiameter : {
        type : String
    },
    stock : {
        type : Number,
        default : 0
    }
},{
    timestamps : true
});

const ProductModel = mongoose.model("product",productSchema);

module.exports = ProductModel;