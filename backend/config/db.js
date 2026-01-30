const mongoose = require("mongoose");

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("Connected")
    }
    catch(err) {
        console.log("Error",err)
    }
}

module.exports = connectDB;