const { StatusCodes } = require("http-status-codes");
const BaseApiError = require("./baseApiError");

class BadRequestApiError extends BaseApiError {
  status = StatusCodes.BAD_REQUEST;
  constructor(message) {
    super(message);
  }
}

module.exports = BadRequestApiError;
