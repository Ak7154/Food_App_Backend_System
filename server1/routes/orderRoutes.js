express = require("express");
const axios = require("axios");
const { Order } = require("../model1");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {id,totalAmount, status, source } = req.body;

    console.log(" server-1 order creation received");

    // validation
    if (!totalAmount) {
      console.log("server-1 validation failed");
      return res.status(400).json({ message: "Totalamount required" });
    }

    // creating order
    const order = await Order.create({
      id,
      totalAmount,
      status,
      source,
    });

    console.log("server-1 Order created:");

    // sync to server 2
    if (source !== "server2") {
      console.log("server-1 Syncing order to Server 2");

      await axios.post("http://localhost:5002/api/orders", {
        id: id,
        totalAmount,
        status,
        source : "server1",
      })

      console.log("server-1 Order synced to Server 2");
    }
    res.status(201).json(order);

  } catch (error) {
    console.error("server-1  Error:", error.message);
    res.status(500).json({ message: "something error" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, status, source } = req.body;

    console.log("server-1 Update order request:", id);

    const order = await Order.findByPk(id);

    if (!order) {
      console.log("[SERVER-1] Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    // update locally
    if (totalAmount !== undefined) order.totalAmount = totalAmount;
    if (status) order.status = status;

    await order.save();
    console.log("[SERVER-1] Order updated locally");

    // sync update to server2
    if (source !== "server2") {
      console.log("[SERVER-1] Syncing update to Server 2");

      await axios.put(`http://localhost:5002/api/orders/${id}`, {
        totalAmount,
        status,
        source: "server1",
      });

      console.log("[SERVER-1] Update synced to Server 2");
    }

    res.json(order);
  } catch (error) {
    console.error("[SERVER-1] Update error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.body;

    console.log("server-1 Delete request");

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "no order found" });
    }

    await order.destroy();
    console.log("server-1 Order deleted ");

    if (source !== "server2") {
      console.log("server-1 Syncing delete to Server 2");

      await axios.delete(`http://localhost:5002/api/orders/${id}`, {
        source: "server1",
      });
    }

    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error("server-1 Delete error:");
    res.status(500).json({ message: "Internal error" });
  }
});


module.exports = router;
