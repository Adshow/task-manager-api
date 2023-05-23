const { USER_ROLES } = require("../constants");
const ForbiddenApiError = require("../errors/forbiddenApiError");
const NotFoundApiError = require("../errors/notFoundApiError");
const Task = require("../models/Task");

const checkTaskAuthorization = async (req, res, next) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    throw new NotFoundApiError("Task not found");
  }

  if (task.userId !== req.user.id && req.user.role !== USER_ROLES.MANAGER) {
    throw new ForbiddenApiError("User doesn't have access to the task");
  }

  req.task = task;
  next();
};

module.exports = checkTaskAuthorization;
