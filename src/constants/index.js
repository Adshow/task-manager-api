const USER_ROLES = {
  MANAGER: "Manager",
  TECHNICIAN: "Technician",
};

const JWT_EXPIRES_IN = "24h";

const MESSAGE_MIN_LENGTH = 1;
const MESSAGE_MAX_LENGTH = 2500;

module.exports = {
  USER_ROLES,
  JWT_EXPIRES_IN,
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
};
