const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./dbConnection/db");
require("./model1");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

sequelize.sync().then(() => {
  console.log("server 1 Tables synced");
});

app.get("/", (req, res) => {
  res.send("Server 1 is running");
});

app.listen(5001, () => {
  console.log("server 1 running on port 5001");
});
