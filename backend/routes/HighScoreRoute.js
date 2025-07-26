const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const HighScore = require("../model/highScore");

router.patch("/update_score", async (req, res) => {
  try {
       
    const { mail, score } = req.body;
    const data = await HighScore.findOneAndUpdate(
      { mail: mail },
      { $set: { "Score.snake": score } },
      { new: true, upsert: true } // return updated doc, create if not exists
    );
    res.json({ message: "Successfully Updated", status: 200 });
  } catch (error) {
    console.log(error.message);
    res.json({ message: "Error in Update", status: 400, error: error.message });
  }
});

router.post("/get_score", async (req, res) => {
  try {
    const { mail } = req.body;
    const response = await HighScore.findOne({ mail });
    res.json({
      message: "Successfully Recieved",
      score: response.Score.snake,
      status: 200,
    });
  } catch (error) {
    console.log(error.message);
    
    res.json({ message: error.message, score: 0, status: 400 });
  }
});

module.exports = router;
