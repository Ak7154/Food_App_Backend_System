const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "food_app_server2", // database name
  "root", // user name
  "amjath", // password
  {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("server 2 Connected successfully");
  } catch (error) {
    console.error("server 2 Connection failed:", error.message);
  }
};

module.exports = { sequelize, connectDB };
