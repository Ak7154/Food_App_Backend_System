const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "food_app_server1",   // DB name
  "root",               // username
  "amjath",      // password
  {
    host: "localhost",
    dialect: "mysql",  //what we using database to sequelize
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(" server 1 Connected successfully");
  } catch (error) {
    console.error("server 1 Connection failed:", error.message);
  }
};

module.exports = { sequelize, connectDB };
