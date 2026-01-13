const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Product } = require("../model1");
const logger =require("../logger")

//create product

router.post("/", async (req, res) => {
  try {
    const { id, name, price, category, available, source } = req.body;

    logger.info("product Create request");

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = await Product.create({
      id,
      name,
      category,
      price,
      available,
    });

    if (source !== "server2") {
      logger.info("server-1 Syncing order to Server 2");

      await axios.post("http://localhost:5002/api/products", {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        available: product.available,
        source: "server1",
      });

      logger.info("server-1 Order synced to Server 2");
    }

    res.status(201).json(product);
  } catch (error) {
    logger.error("server-1 Error:", error.message);
    res.status(500).json({ message: "something error" });
  }
});

//update product

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
    product.category = category
    product.available = available
    product.source = source;

    await product.save();

    
    if (source !== "server2") {
      await axios.put(`http://localhost:5002/api/products/${id}`, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        available: product.available,
        source: "server1",
      });
    }
    res.status(200).json(product)
  } catch (error) {
    logger.error("server-1 Error:", error.message)
    res.status(500).json({ message: "something error" })
  }
  
});

//delete product

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.query;

    logger.info("server-1 Product delete request")

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    await product.destroy();
    logger.info("server-1 Product deleted");

    // 🔁 sync to server-2
    if (source !== "server2") {
      logger.info("server-1 Syncing product delete to server-2")

      try {
        await axios.delete(
          `http://localhost:5002/api/products/${id}?source=server2`
        );
      } catch (syncErr) {
        logger.error("Product delete sync failed:", syncErr.message);
      }
    }

    return res.json({ message: "Product deleted" });

  } catch (error) {
    logger.error("server-1 Product delete error:", error.message);

    if (res.headersSent) return;
    return res.status(500).json({ message: "something error inside" })
  }
});

module.exports = router;
