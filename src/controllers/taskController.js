const { USER_ROLES } = require("../constants");
const Task = require("../models/Task");
const User = require("../models/User");
const { sendNotificationEmail } = require("../services/notificationService");
const { StatusCodes } = require("http-status-codes");
const taskFacade = require("../facades/taskFacade");

// GET all tasks
const getAllTasks = async (req, res) => {
  const tasks = await taskFacade.getAllTasks(req.user);
  return res.json(tasks);
};

// GET a task by ID
const getTaskById = async (req, res) => {
  //Task is set in request object via checkTaskAuthorization middleware
  return res.json(req.task);
};

// CREATE a new task
const createTask = async (req, res) => {
  const { summary, datePerformed } = req.body;
  const task = await taskFacade.createTask(summary, datePerformed, req.user);
  return res.status(StatusCodes.CREATED).json(task);
};

// UPDATE a task
const updateTask = async (req, res) => {
  const task = await taskFacade.updateTask(req.params.id, req.body, req.user);
  return res.json({ message: "Task updated successfully.", task });
};

// DELETE a task
const deleteTask = async (req, res) => {
  await taskFacade.deleteTask(req.params.id, req.user);
  return res
    .status(StatusCodes.OK)
    .json({ message: "Task deleted successfully." });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
