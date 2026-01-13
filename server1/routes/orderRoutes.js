const express = require("express");
const axios = require("axios");
const router = express.Router();
const { Order, User, Product } = require("../model1");
const logger = require("../logger");

//creating order

router.post("/", async (req, res) => {
  try {
    const { id, userId, productId, totalAmount, status, source } = req.body;

    logger.info("server-1 order creation received");

    if (!totalAmount || !userId || !productId) {
      logger.error("server-1 validation failed");
      return res.status(400).json({
        message: "required userid and productId and totalamount",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      logger.error("server-1 User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      logger.error("server-1 Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info("server-1 Order creating");

    const order = await Order.create({
      id,
      userId,
      productId,
      totalAmount,
      status,
      source,
    });

    logger.info("server-1 Order created");

    if (source !== "server2") {
      logger.info("server-1 Syncing order to Server 2");

      await axios.post("http://localhost:5002/api/orders", {
        id: order.id,
        userId: order.userId,
        productId: order.productId,
        totalAmount: order.totalAmount,
        status: order.status,
        source: "server1",
      });

      logger.info("server-1 Order synced to Server 2");
    }

    res.status(201).json(order);
  } catch (error) {
    logger.error(`server-1 order creation Error: ${error.message}`)
    res.status(500).json({ message: "something error inside" });
  }
});


//updating order

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, status, source } = req.body;

  logger.info("server-1 Update order request received");

    const order = await Order.findByPk(id);
    if (!order) {
      logger.info("server-1 no order found");
      return res.status(404).json({ message: "no order found" });
    }

    order.totalAmount = totalAmount;
    order.status = status;

    await order.save();
    logger.info("server-1 Order updated locally");

    if (source !== "server2") {
      logger.info("server-1 Syncing update to Server 2");

      await axios.put(`http://localhost:5002/api/orders/${id}`, {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        source: "server1",
      });
    }
    res.json(order);
  } catch (error) {
    logger.error("server-1 Update error:", error.message);
    res.status(500).json({ message: "something eror inside" });
  }
});

//deleting order

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.query;

    logger.info("server-1 Delete request");

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "no order found" });
    }

    await order.destroy();
    logger.info("server-1 Order deleted ");

    if (source !== "server2") {
      console.log("server-1 Syncing delete to Server 2");

      await axios.delete(
        `http://localhost:5002/api/orders/${id}?source=server2`
      );
    }

    res.json({ message: "Order deleted" });
  } catch (error) {
    logger.error("server-1 Delete error:");
    res.status(500).json({ message: "something error inside" });
  }
});

module.exports = router;
