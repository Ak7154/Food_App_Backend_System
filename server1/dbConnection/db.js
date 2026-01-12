const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "food_app_server1",   // DB name
  "root",               // username
  "amjath",      // password
  {
    host: "localhost", // host
    dialect: "mysql",  //what we using database to sequelize
    logging: false,  // its help us to dont show query in log
  }
);

const database = async () => {
  try {
    await sequelize.authenticate();
    console.log(" server 1 connected");
  } catch (error) {
    console.error("server 1 Connection failed", error.message);
  }
};

module.exports = { sequelize, database };
