const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const signUpRoute = require("./routes/SignUpRoute")
const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.post("/get",(req,res)=>{
    console.log(req.body);
    res.json({msg:"Successfully sent the data",status:201,response:req.body})  
})

app.use("/api",signUpRoute);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
