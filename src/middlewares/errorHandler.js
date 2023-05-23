const { StatusCodes } = require("http-status-codes");
const { ValidationError } = require("sequelize");
const BadRequestApiError = require("../errors/badRequestApiError");
const BaseApiError = require("../errors/baseApiError");

const normalizeError = (err) => {
  if (err instanceof ValidationError) {
    return new BadRequestApiError(err.message);
  }
  if (err instanceof BaseApiError) {
    return err;
  }
  return new BaseApiError(err.message);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.log(err);
  err = normalizeError(err);
  return res.status(err.status).json({ message: err.message });
};

module.exports = errorHandler;
