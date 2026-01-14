const { DataTypes } = require("sequelize");
const { sequelize } = require("../dbConnection/db");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "products",
      key: "id",
    },
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "created",
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: "server2",
  },
});

module.exports = Order;
