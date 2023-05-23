const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_EXPIRES_IN } = require("../constants");
const userService = require("../services/userService");
const UnauthorizedApiError = require("../errors/unauthorizedApiError");

const authenticateUser = async (email, password) => {
  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedApiError("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedApiError("Invalid credentials");
  }

  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

module.exports = { authenticateUser };
