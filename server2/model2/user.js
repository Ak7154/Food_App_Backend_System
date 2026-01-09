const { DataTypes } = require("sequelize");
const { sequelize } = require("../dbConnection/db");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
  },

  email: {
    type: DataTypes.STRING,
  },

  role: {
    type: DataTypes.STRING,
  },
});

module.exports = User;
