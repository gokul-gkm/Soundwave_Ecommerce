require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const MONGO_URL = process.env.MONGO_URL;
    if (!MONGO_URL) {
      throw new Error("❌ MONGO_URL is not defined");
    }
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;