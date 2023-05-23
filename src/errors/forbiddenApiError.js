const { StatusCodes } = require("http-status-codes");
const BaseApiError = require("./baseApiError");

class ForbiddenApiError extends BaseApiError {
  status = StatusCodes.FORBIDDEN;
  constructor(message) {
    super(message);
  }
}

module.exports = ForbiddenApiError;
