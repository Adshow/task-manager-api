const { StatusCodes } = require("http-status-codes");
const BaseApiError = require("./baseApiError");

class UnauthorizedApiError extends BaseApiError {
  status = StatusCodes.UNAUTHORIZED;
  constructor(message) {
    super(message);
  }
}

module.exports = UnauthorizedApiError;
