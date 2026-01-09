const { DataTypes } = require("sequelize");
const { sequelize } = require("../dbConnection/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull:false
  
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull:false
  },

  description: {
    type: DataTypes.STRING,
    allowNull:false

  },
});

module.exports = Product;
