const express = require("express");
const axios = require("axios");
const router = express.Router();
const { User } = require("../model1");
const logger = require("../logger")

router.post("/", async (req, res) => {
  try {
    const { id, name, email, role, source } = req.body

    logger.info("server-1 user create request");

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    // Create locally, accept ID if coming from Server-2

    const user = await User.create({
      id,
      name,
      email,
      role,
    });

    logger.info("server-1 User created locally");

    // Sync to Server-2 only if not coming from Server-2

    if (source !== "server2") {
      logger.info("server-1 Syncing user to Server-2");

      await axios.post("http://localhost:5002/api/users", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        source: "server1",
      });

      logger.info("server-1  User synced to Server-2");
    }

    res.status(201).json(user);
  } catch (error) {
    logger.error("server-1 User error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
