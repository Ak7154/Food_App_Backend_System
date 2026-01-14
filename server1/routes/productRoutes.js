const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Product } = require("../model1");
const logger = require("../logger");
const { verifyToken } = require("../authormiddleware/authmiddle");

//create product

router.post("/", verifyToken, async (req, res) => {
  try {
    const { id, name, price, category, available, source } = req.body;

    logger.info(" server-1 Product creation");

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }
      logger.info("server-1 product creating")
    const product = await Product.create({
      id,
      name,
      category,
      price,
      available,
    });
     logger.info("server-1 product created")
    if (source !== "server2") {
      try {
        logger.info("server-1 Syncing product to Server 2");

        await axios.post("http://localhost:5002/api/products", {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          available: product.available,
          source: "server1",
        });

        logger.info("server-1 Product synced to Server 2");
      } catch (syncErr) {
        logger.error("server-1 Product sync failed: " + syncErr.message);
      }
    }

    return res.status(201).json(product);
  } catch (error) {
    logger.error("server-1 Product create error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//update product

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, available, source } = req.body;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    logger.info("server-1 updating")

    product.name = name;
    product.price = price;
    product.category = category;
    product.available = available;
    product.source = source;

    await product.save();

    if (source !== "server2") {
      logger.info("server-1 sync with server-2")
      await axios.put(`http://localhost:5002/api/products/${id}`, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        available: product.available,
        source: "server1",
      });
    }
    logger.info("server-1 updated synced with server-2")
    res.status(200).json(product);
  } catch (error) {
    logger.error("server-1 Error");
    res.status(500).json({ message: "something error" });
  }
});

//delete product

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.body;

    logger.info("server-1 Product delete request");

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();
    logger.info("server-1 Product deleted");

    // sync to server-2
    if (source !== "server2") {
      logger.info("server-1 Syncing product delete to server-2");

      try {
        await axios.delete(
          `http://localhost:5002/api/products/${id}`,
          { data: { source: "server1" } }
        );
      } catch (syncErr) {
        logger.error("server-1 Product delete sync skipped");
      }
    }

    return res.json({ message: "Product deleted" });

  } catch (error) {
    logger.error(`server-1 Product delete error`);
  }
});


module.exports = router;
