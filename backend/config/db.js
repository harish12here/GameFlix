const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (e) {
    console.error("DB connection error:", e.message);
  }
};

module.exports = {connectDB};
