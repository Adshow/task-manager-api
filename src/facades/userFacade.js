const { USER_ROLES } = require("../constants");
const BadRequestApiError = require("../errors/badRequestApiError");
const userService = require("../services/userService");

const createTechnician = async (name, role, email, password, managerId) => {
  const manager = await userService.findUserById(managerId);
  if (!manager && manager.role !== USER_ROLES.MANAGER) {
    throw new BadRequestApiError("Technician user must have a manager ID");
  }
  return await userService.createUser(name, role, email, password, managerId);
};

const createManager = async (name, role, email, password) =>
  await userService.createUser(name, role, email, password);

const createUser = async (name, role, email, password, managerId) => {
  if (managerId) {
    return await createTechnician(name, role, email, password, managerId);
  }
  return await createManager(name, role, email, password);
};

module.exports = { createUser };
