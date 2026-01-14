const express = require("express");
const axios = require("axios");
const router = express.Router();
const { Product } = require("../model2");
const logger = require("../logger")
const { verifyToken } = require("../authormiddleware/authmiddle");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { id, name, price, category, available, source } = req.body;

    logger.info(" server-2 Product create request");

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = await Product.create({
      id,
      name,
      category,
      price,
      available
    });

    if (source !== "server1") {
      try {
        logger.info("server-2 Syncing product to Server 1");

        await axios.post("http://localhost:5001/api/products", {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          available: product.available,
          source: "server2",
        });

        logger.info("server-2 Product synced to Server 1");
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


router.put("/:id", verifyToken,async (req, res) => {
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
      logger.info("server2 syncing with server1")
      await axios.put(`http://localhost:5001/api/products/${id}`, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        available: product.available,
        source: "server2",
      });
    }
    logger.info("server2 synced with server1")
    res.status(200).json(product)
  } catch (error) {
    logger.error("server-2 Error:", error.message);
    res.status(500).json({ message: "something error" })
  }
  
});

// SERVER 2
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.body;

    logger.info("server-2 Product delete request");

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();
    logger.info("server-2 Product deleted");

    // sync to server-1
    if (source !== "server1") {
      logger.info("server-2 Syncing product delete to server-1");

      try {
        await axios.delete(
          `http://localhost:5001/api/products/${id}`,
          { data: { source: "server2" } }
        );
      } catch (syncErr) {
        logger.error("server-2 Product delete sync ");
      }
    }

    return res.json({ message: "Product deleted" });

  } catch (error) {
    logger.error(`server-2 Product delete error: ${error.message}`);
  }
});




module.exports = router;
