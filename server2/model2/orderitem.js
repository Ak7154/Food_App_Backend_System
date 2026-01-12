const { DataTypes } = require("sequelize");
const { sequelize } = require("../dbConnection/db");

const Orderitem = sequelize.define("orderitem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
    quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },
    price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    },
});

module.exports = Orderitem;
