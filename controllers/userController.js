const User = require("../models/User");

// @desc   Get all users
// @route  GET /api/users
// @access Public
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Server error while fetching users." });
  }
};

// @desc   Create a new user
// @route  POST /api/users
// @access Public (for now, you can secure later)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide all required fields." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }
    const newUser = await User.create({ name, email, password });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Server error while creating user." });
  }
};
