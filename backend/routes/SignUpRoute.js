const express = require("express");
const signUp = require("../model/signUp");
const HighScore = require("../model/highScore");
const router = express.Router();
router.post("/signup", async (req, res) => {
  try {
    const { name, mail, password } = req.body;
    console.log(name);

    const findId = await signUp.findOne({ mail });
    if (findId) res.json({ message: "Mail id Already Exist", satus: 202 });
    const data = new signUp({ name, mail, password });
    await data.save();
    // Set the Data 
    try {
      const setScore = new HighScore({ mail });
      console.log("Successfully Set Score");
      await setScore.save();
    } catch (error) {
      console.log(error.message);
    }
    res.json({ message: "Successfully added the data", status: 201 });
  } catch (e) {
    console.log("Error in Sign up ", e.message);
    res.json({
      message: "Error in Signup the Data",
      error: e.message,
      status: 400,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    
    const { mail, password } = req.body;
    const findId = await signUp.findOne({ mail });
    if (!findId) res.json({ error: "Mail id Does not Exist", satus: 400 });
    if (password === findId.password) {
      res.json({
        message: "Successfully Logined",
        status: 201,
        name: findId.name,
      });
    } else {
      res.json({ error: "Invalid Password", status: 400 });
    }
  } catch (error) {
    console.log("Error in login", error.message);
    res.json({ message: "Error in Login", error: error.message, status: 400 });
  }
});

router.get("/all", async (req, res) => {
  try {
    const data = await new signUp.find({});
    res.json(data);
  } catch (error) {
    console.log(error.message);
  }
});
module.exports = router;
