const { Sequelize } = require("sequelize");
const logger=require("../logger")

const sequelize = new Sequelize(
  process.env.DB_NAME, // database name
  process.env.DB_USER, // user name
  process.env.DB_PASSWORD, // password
  {
    host:process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("server 2 Connected successfully")
  } catch (error) {
    logger.error("server 2 Connection failed:", error.message)
  }
};

module.exports = { sequelize, connectDB };
