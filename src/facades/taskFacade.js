const { USER_ROLES } = require("../constants");
const BaseApiError = require("../errors/baseApiError");
const ForbiddenApiError = require("../errors/forbiddenApiError");
const NotFoundApiError = require("../errors/notFoundApiError");
const taskService = require("../services/taskService");
const userService = require("../services/userService");
const { sendNotificationEmail } = require("../services/notificationService");

const getAllTasks = async (user) => {
  try {
    let tasks;

    if (user.role === USER_ROLES.TECHNICIAN) {
      tasks = await taskService.findTasksByUserId(user.id);
    } else if (user.role === USER_ROLES.MANAGER) {
      tasks = await taskService.findTasks();
    }
  } catch (error) {
    throw new BaseApiError("Failed to fetch tasks. Please try again later.");
  }
};

const createTask = async (summary, datePerformed, user) => {
  const task = await taskService.createTask(summary, datePerformed, user.id);

  if (
    process.env.NODE_ENV !== "test" &&
    req.user.role === USER_ROLES.TECHNICIAN
  ) {
    const manager = await userService.findUserById(user.managerId);
    const technicianName = user.name;
    sendNotificationEmail(manager.email, technicianName, task.summary);
  }

  return task;
};

const updateTask = async (taskId, taskData, user) => {
  const task = await taskService.findTaskById(taskId);
  if (!task) {
    throw new NotFoundApiError("Task not found.");
  }
  if (task.userId !== user.id && user.role !== USER_ROLES.MANAGER) {
    throw new ForbiddenApiError(
      "Access denied. You are not authorized to update this task."
    );
  }
  try {
    await task.update(taskData);
    return task;
  } catch (error) {
    throw new BaseApiError("Failed to update task. Please try again later.");
  }
};

const deleteTask = async (taskId, user) => {
  const task = await taskService.findTaskById(taskId);
  if (!task) {
    throw new NotFoundApiError("Task not found.");
  }

  if (user.role !== USER_ROLES.MANAGER) {
    throw new ForbiddenApiError(
      "Access denied. You are not authorized to delete this task."
    );
  }
  try {
    await task.destroy();
  } catch (error) {
    throw new BaseApiError("Failed to delete task. Please try again later.");
  }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
