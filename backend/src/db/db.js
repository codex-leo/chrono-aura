const mongoose = require("mongoose");

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL,{
            dbName : "chronoAura"
        });

        console.log("Connected to database successfully");

    } catch(err) {
        console.log(err);
    }
}

module.exports = connectDB;