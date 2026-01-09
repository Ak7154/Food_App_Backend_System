const { DataTypes } = require("sequelize");
const { sequelize } = require("../dbConnection/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING
  },

  price: {
    type: DataTypes.FLOAT
  },

  description: {
    type: DataTypes.STRING
  },
});

module.exports = Product;
