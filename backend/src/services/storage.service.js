//using imagekit as storage service provider

const ImageKit = require("@imagekit/nodejs");

const client = new ImageKit({
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

const uploadConfig = {
  product: {
    folderDest: "/products",
    prefixName: "product",
  },
  brand: {
    folderDest: "/brands",
    prefixName: "logo",
  },
  review: {
    folderDest: "/products/reviews",
    prefixName: "review",
  },
};

const uploadFile = async (file, type = "product") => {
  const config = uploadConfig[type];

  if (!config) {
    throw new Error("Invalid Type.");
  }

  const result = await client.files.upload({
    file: file,
    fileName: `${config.prefixName}_${Date.now()}_${Math.random() * 10000}`,
    folder: `ChronoAura${config.folderDest}`,
  });

  return result;
};

module.exports = { uploadFile };
