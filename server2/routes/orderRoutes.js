const express = require("express");
const axios = require("axios");
const router = express.Router();
const { Order, User, Product } = require("../model2");
const logger = require("../logger");
const { verifyToken } = require("../authormiddleware/authmiddle");

router.post("/", verifyToken,async (req, res) => {
  try {
    const { id, userId, productId, totalAmount, status, source } = req.body;

    logger.info("server-2 order creation received");

    // validation 
    if (totalAmount == null || !userId || !productId) {
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
      logger.error("server-2 Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info("server-2 Order creating");
    
    const orderData = {
      userId,
      productId,
      totalAmount,
      status,
      source: source || "server2",
    };

    if (id) {
      orderData.id = id;
    }

    const order = await Order.create(orderData);

    logger.info("server-2 Order created");

    // sync
    if (orderData.source !== "server1") {
      logger.info("server-2 Syncing order to Server 1");

      await axios.post("http://localhost:5001/api/orders", {
        id: order.id,
        userId: order.userId,
        productId: order.productId,
        totalAmount: order.totalAmount,
        status: order.status,
        source: "server2",
      });

      logger.info("server-2 Order synced to Server 1");
    }

    res.status(201).json(order);
  } catch (error) {
    logger.error(`server-2 order creation Error`);
    res.status(500).json({ message: "something error inside" });
  }
});


// update order
router.put("/:id",verifyToken, async (req, res) => {
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
    logger.info("server-2 Order updated");

    // sync update to server2
    if (source !== "server1") {
      logger.info("server-2 Syncing update to Server 1");

      await axios.put(`http://localhost:5001/api/orders/${id}`, {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        source: "server2",
      });
    }
    logger.info("server2 synced with server-1")
    res.json(order);
  } catch (error) {
    logger.error("server-2 Update error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
});

// router
router.delete("/:id", verifyToken,async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "no order found" });
    }

    await order.destroy();
    logger.info("server-2 Order deleted ");

    if (source !== "server1") {
      logger.info("server-2 Syncing product delete to server-1");

      try {
        await axios.delete(`http://localhost:5001/api/orders/${id}`, {
          data: { source: "server1" },
        });
      } catch (syncErr) {
        logger.error("Product delete sync failed:", syncErr.message);
      }
    }
    return res.json({ message: "Order deleted" });
  } catch (error) {
    logger.error("server-2 Delete error:");
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
