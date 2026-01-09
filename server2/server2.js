const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./dbConnection/db");
require("./model2");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

sequelize.sync().then(() => {
  console.log("server 2 Tables synced");
});

app.get("/", (req, res) => {
  res.send("Server 2 is running");
});

app.listen(5002, () => {
  console.log("server 2 running on port 5002");
});
