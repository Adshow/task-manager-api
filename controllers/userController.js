const User = require('../models/User');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, role, email, password, managerId } = req.body;
    const user = await User.create({ name, role, email, password, managerId });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
