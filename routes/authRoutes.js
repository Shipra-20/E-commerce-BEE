const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateRegistration } = require("../utils/validators");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();
const users = [];

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  const error = validateRegistration(name, email, password);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(user => user.email === normalizedEmail)) {
    return res.status(409).json({
      message: "An account with this email already exists."
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    };

    users.push(user);

    const token = createToken(user);

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { name: user.name, email: user.email }
    });
  } catch {
    res.status(500).json({
      message: "Unable to create your account."
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      message: "Enter your email and password."
    });
  }

  const user = users.find(
    item => item.email === email.trim().toLowerCase()
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  res.json({
    message: "Login successful!",
    token: createToken(user),
    user: { name: user.name, email: user.email }
  });
});

router.get("/me", requireAuth, (req, res) => {
  const user = users.find(item => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found."
    });
  }

  res.json({
    user: { name: user.name, email: user.email }
  });
});

module.exports = router;