const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./dbConnection/db");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const logger = require("./logger")
require("./model2");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

connectDB();

sequelize.sync().then(() => {
  logger.info("server 2 Tables synced")
});

app.listen(5002, () => {
  logger.info("server 2 running on port 5002");
})
