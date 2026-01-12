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
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: "customer",
  },
});

module.exports = User;
