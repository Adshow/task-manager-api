const User = require("../models/User");

const createUser = async (name, role, email, password, managerId) =>
  await User.create({ name, role, email, password, managerId });

const findUserById = async (id) => await User.findByPk(id);

const findUserByEmail = async (email) =>
  await User.findOne({ where: { email } });

module.exports = { createUser, findUserById, findUserByEmail };
