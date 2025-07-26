const mongoose = require("mongoose");

const sch = new mongoose.Schema({
  mail: {
    type: String,
    unique: true,
    required: true,
  },
  Score: {
    snake: {
      type: Number,
      default: 0,
    }
  },
});

module.exports = mongoose.model("HighScore", sch);
