const { Sequelize } = require("sequelize");
const logger = require("../logger");

const sequelize = new Sequelize(
  process.env.DB_NAME, // DB name
  process.env.DB_USER, // username
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST, // host
    dialect: "mysql", //what we using database to sequelize
    logging: false, // its help us to dont show query in log
  }
);

const database = async () => {
  try {
    await sequelize.authenticate();
    logger.info("server 1 connected");
  } catch (error) {
    logger.error("server 1 Connection failed", error.message);
  }
};

module.exports = { sequelize, database };
