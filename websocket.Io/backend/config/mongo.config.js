const mongoose = require("mongoose");
require('dotenv').config();

const {MONGODB_URI, DB_NAME} = process.env;

const connectDB = async () => {
  try {
    console.log(MONGODB_URI)
    await mongoose.connect(
      `${MONGODB_URI}/${DB_NAME}?authSource=admin`
    );

        // mongodb://root:rootpassword@localhost:27017/chat_app?authSource=admin


    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = { connectDB, mongoose };
