const jwt = require('jsonwebtoken');
const User = require('../models/User');


const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findByPk(decoded.userId);
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateUser;
