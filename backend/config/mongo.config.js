const mongoose = require("mongoose");
require('dotenv').config();

const {MONGO_DB_HOST, MONGO_DB_USER, MONGO_DB_PASSWORD, MONGO_PORT} = process.env;

const connectDB = async () => {
  try {
    console.log(`mongodb://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@${MONGO_DB_HOST}:${MONGO_PORT}/chat_app?authSource=admin`)
    await mongoose.connect(
      `mongodb://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@${MONGO_DB_HOST}:${MONGO_PORT}/chat_app?authSource=admin`
    );

        // mongodb://root:rootpassword@localhost:27017/chat_app?authSource=admin


    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = { connectDB, mongoose };
