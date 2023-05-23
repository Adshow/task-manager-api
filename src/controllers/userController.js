const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const userFacade = require("../facades/userFacade");

// Create a new user
const createUser = async (req, res) => {
  const { name, role, email, password, managerId } = req.body;
  const user = await userFacade.createUser(
    name,
    role,
    email,
    password,
    managerId
  );
  return res.status(StatusCodes.CREATED).json(user);
};

module.exports = { createUser };
