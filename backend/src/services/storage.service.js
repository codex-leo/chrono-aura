const ImageKit = require("@imagekit/nodejs");

const client = new ImageKit({
    privateKey : process.env.IMAGE_KIT_PRIVATE_KEY
});

const uploadFile = async(file,type='product') => {
    const folderDest = (type === "product") ? "/products" : "/brands";
    const prefixName = (type === "product") ? "product" : "logo";

    const result = await client.files.upload({
        file : file,
        fileName : `${prefixName}_${Date.now()}`,
        folder : `ChronoAura${folderDest}`
    });

    return result;
};

module.exports = { uploadFile };