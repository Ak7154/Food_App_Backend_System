const express = require("express");
const axios = require("axios");
const router = express.Router();
const { Product } = require("../model2");
const logger = require("../logger")

router.post("/", async (req, res) => {
  try {
    const { id, name, price, category, available, source } = req.body;

    logger.info("server-2 Product create request");

    if (!name || price == null) {
      return res.status(400).json({
        message: "Name and price are required",
      });
    }

    // Server-2 accepts ID if coming from Server-1
    const product = await Product.create({
      id,
      name,
      category,
      price,
      available,
      source,
    });

    logger.info("server-2 Product created locally:", product.id);

    // Sync to Server-1 only if not coming from Server-1
    if (source !== "server1") {
      logger.info("server-2  Syncing product to Server-1");

      await axios.post("http://localhost:5001/api/products", {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        source: "server2",
      });

      logger.info("server-2 Product synced to Server-1");
    }

    res.status(201).json(product);
  } catch (error) {
    logger.error("server-2 Product error:", error.message);
    res.status(500).json({ message: "Internal error" })
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, available, source } = req.body
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.name = name;
    product.price = price;
    product.category = category;
    product.available = available
    product.source = source;

    await product.save();

    
    if (source !== "server1") {
      await axios.put(`http://localhost:5001/api/products/${id}`, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        available: product.available,
        source: "server2",
      });
    }
    res.status(200).json(product)
  } catch (error) {
    logger.error("server-2 Error:", error.message);
    res.status(500).json({ message: "something error" })
  }
  
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { source} = req.query;

    logger.info("server-1 Product delete request");

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();
    logger.info("server-1 Product deleted");

    // 🔁 sync to server-2
    if (source !== "server1") {
      logger.info("server-1 Syncing product delete to server-2");

      try {
        await axios.delete(
          `http://localhost:5001/api/products/${id}?source=server1`
        );
      } catch (syncErr) {
        logger.error("Product delete sync failed:", syncErr.message);
      }
    }

    return res.json({ message: "Product deleted" });

  } catch (error) {
    logger.error("server-1 Product delete error:", error.message);

    if (res.headersSent) return;
    return res.status(500).json({ message: "something error inside" });
  }
});



module.exports = router;
