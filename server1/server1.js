const express = require("express");
const cors = require("cors");
const { database, sequelize } = require("./dbConnection/db");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const app = express();
const logger = require("./logger")

database();

app.use(cors());
app.use(express.json());

//all routes

app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

sequelize.sync().then(() => {
  logger.info("server 1 Tables synced"); 
});

app.listen(5001, () => {
  logger.info("server 1 running on port 5001");
})
