const { StatusCodes } = require("http-status-codes");
const BaseApiError = require("./baseApiError");

class NotFoundApiError extends BaseApiError {
  status = StatusCodes.NOT_FOUND;
  constructor(message) {
    super(message);
  }
}

module.exports = NotFoundApiError;
