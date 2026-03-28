require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;