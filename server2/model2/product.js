const { DataTypes } = require("sequelize");
const { sequelize } = require("../dbConnection/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "veg",
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  available: {
    type: DataTypes.STRING,
    defaultValue:"not available",
  },
});

module.exports = Product;
