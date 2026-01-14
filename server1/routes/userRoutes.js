const express = require("express");
const router = express.Router();
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../model1");


//registering the user

router.post("/register", async (req, res) => {
  try {
    const { id, name, email, password, role, source } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      id,
      name,
      email,
      password: hashedPassword,
      role,
    });

    //syncing

    if (source !== "server2") {
      await axios.post(`http://localhost:5002/api/users/register`, {
        id:user.id,
        name,
        email,
        password:hashedPassword, // send hashed password
        role,
        source: "server1",
      });
    }

    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("User registration error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
});

// login by user

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
