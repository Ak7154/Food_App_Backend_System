const express = require("express");
const axios = require("axios");
const router = express.Router();
const { Order, User, Product } = require("../model2");
const logger = require("../logger");

router.post("/", async (req, res) => {
  try {
    const { id, userId, productId, totalAmount, status, source } = req.body;

    logger.info("server-2 order creation received");

    if (!totalAmount || !userId || !productId) {
      logger.error("server-2 validation failed");
      return res.status(400).json({
        message: "required userid and productId and totalamount",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      logger.error("server-2 User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      logger.error("server-1 Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info("server-2 Order creating");

    const order = await Order.create({
      id,
      userId,
      productId,
      totalAmount,
      status,
      source,
    });

    logger.info("server-2 Order created");

    if (source !== "server1") {
      logger.info("server-2 Syncing order to Server 1");

      await axios.post("http://localhost:5001/api/orders", {
        id: order.id,
        userId: order.userId,
        productId: order.productId,
        totalAmount: order.totalAmount,
        status: order.status,
        source: "server1",
      });

      logger.info("server-2 Order synced to Server 2");
    }

    res.status(201).json(order);
  } catch (error) {
    logger.error(`server-2 order creation Error: ${error.message}`);
    res.status(500).json({ message: "something error inside" });
  }
});

// update order
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, status, source } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      logger.info("server-2 Order not found");
      return res.status(404).json({ message: "Order not found" });
    }
    order.totalAmount = totalAmount;
    order.status = status;

    await order.save();
    logger.info("server-2 Order updated locally");

    // sync update to server2
    if (source !== "server1") {
      logger.info("[SERVER-2] Syncing update to Server 1");

      const sources = { source: "server2" };
      sources.totalAmount = totalAmount;
      sources.status = status;

      await axios.put(`http://localhost:5001/api/orders/${id}`, sources);
    }

    res.json(order);
  } catch (error) {
    logger.error("server-2 Update error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
});

// router
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.query;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "no order found" });
    }

    await order.destroy();
    logger.info("server-2 Order deleted ");

    if (source !== "server1") {
      logger.info("server-2 Syncing product delete to server-1");

      try {
        await axios.delete(
          `http://localhost:5001/api/order/${id}?source=server1`
        );
      } catch (syncErr) {
        logger.error("Product delete sync failed:", syncErr.message);
      }
    }
    return res.json({ message: "Order deleted" });
  } catch (error) {
    logger.error("server-2 Delete error:");
    res.status(500).json({ message: "Internal error" })
  }
});

module.exports = router;
