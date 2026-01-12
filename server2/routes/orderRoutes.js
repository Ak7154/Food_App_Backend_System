express = require("express");
const axios = require("axios");
const { Order } = require("../model2");

const router = express.Router();

router.post("/", async (req, res) => {
try {
    const { id, totalAmount, status, source } = req.body;

    console.log("[SERVER-2] Create order request received");

    // validation
    if (!totalAmount) {
      console.log("[SERVER-2] Validation failed");
      return res.status(400).json({ message: "Total amount required" });
    }

    // create order locally
    const order = await Order.create({
      id,
      totalAmount,
      status,
      source,
    });

    console.log("[SERVER-2] Order created locally:", order.id);

    // sync to server 2 only if source is not server2
    if (source !== "server1") {
      console.log("[SERVER-2] Syncing order to Server 2");
      await axios.post("http://localhost:5001/api/orders", {
        id: id,
        totalAmount,
        status,
        source : "server2",
      });

      console.log("[SERVER-2] Order synced to Server 2");
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("[SERVER-2] Error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, status, source } = req.body;

    console.log("[SERVER-2] Update order request:", id);

    const order = await Order.findByPk(id);

    if (!order) {
      console.log("[SERVER-2] Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    // update locally
    if (totalAmount !== undefined) order.totalAmount = totalAmount;
    if (status) order.status = status;

    await order.save();
    console.log("[SERVER-2] Order updated locally");

    // sync update to server2
    if (source !== "server1") {
      console.log("[SERVER-2] Syncing update to Server 1");
      await axios.put(`http://localhost:5001/api/orders/${id}`, {
        totalAmount,
        status,
        source : "server2",
      });

      console.log("[SERVER-2] Update synced to Server 1");
    }

    res.json(order);
  } catch (error) {
    console.error("[SERVER-2] Update error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.body;

    console.log("server-2 Delete request");

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "no order found" });
    }

    await order.destroy();
    console.log("server-2 Order deleted ");

    if (source !== "server1") {
      console.log("server-2 Syncing delete to Server 1");

      await axios.delete(`http://localhost:5001/api/orders/${id}`, {
        source: "server2",
      });
    }

    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error("server-2 Delete error:")
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
