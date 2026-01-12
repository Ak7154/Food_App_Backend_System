const { DataTypes } = require("sequelize");
const { sequelize } = require("../dbConnection/db");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "created",
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: "server1",
  },
});

module.exports = Order;
