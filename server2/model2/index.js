const User = require("./user");
const Product = require("./product");
const Order = require("./order");

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(Order, { foreignKey: "productId" });
Order.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
  User,
  Product,
  Order,
};
