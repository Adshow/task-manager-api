const { StatusCodes } = require("http-status-codes");

class BaseApiError extends Error {
  status = StatusCodes.INTERNAL_SERVER_ERROR;
  constructor(message) {
    super(message || "Internal Server Error");
  }
}

module.exports = BaseApiError;
