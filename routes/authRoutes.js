const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// REGISTER new user
router.post("/register", registerUser);

// LOGIN user
router.post("/login", loginUser);

module.exports = router;
