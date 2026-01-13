const express = require("express");
const axios = require("axios");
const router = express.Router();
const { User } = require("../model2"); // Server-2 model
const logger = require("../logger")

router.post("/", async (req, res) => {
  try {
    const { id, name, email, role, source } = req.body

    logger.info("server-2 User create request");

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    // Create locally, accept ID from Server-1 if provided
    const user = await User.create({
      id,
      name,
      email,
      role,
    });

    logger.info("server-2 User created locally:", user.id);

    // Sync to Server-1 only if not coming from Server-1
    if (source !== "server1") {
      logger.info("server-2 Syncing user to Server-1");

      await axios.post("http://localhost:5001/api/users", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        source: "server2",
      });

      logger.info("server-2 User synced to Server-1");
    }

    res.status(201).json(user);
  } catch (error) {
    logger.error("server-2 User error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
