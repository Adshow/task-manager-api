const Task = require('../models/Task');
const User = require('../models/User');
const sendNotificationEmail = require('../services/notificationService');

// GET all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { role, id } = req.user;
    let tasks;

    if (role === 'Technician') {
      tasks = await Task.findAll({ where: { userId: id } });
    } else if (role === 'Manager') {
      tasks = await Task.findAll();
    }

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch tasks. Please try again later.' });
  }
};

// GET a task by ID
exports.getTaskById = async (req, res) => {
  res.json(req.task);
};

// CREATE a new task
exports.createTask = async (req, res) => {
  try {
    const { summary, datePerformed } = req.body;
    const task = await Task.create({
      summary,
      datePerformed,
      userId: req.user.id,
    });

    if (process.env.NODE_ENV !== 'test' && req.user.role === 'Technician') {
      const manager = await User.findOne({ where: { id: req.user.managerId } });
      const technicianName = req.user.name;
      sendNotificationEmail(manager.email, technicianName, task.summary);
    }
    res.status(201).json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message});
  }
};

// UPDATE a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.userId !== req.user.id && req.user.role !== 'Manager') {
      return res.status(401).json({ message: 'Access denied. You are not authorized to update this task.' });
    }

    await task.update(req.body);
    res.json({ message: 'Task updated successfully.', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update task. Please try again later.' });
  }
};

// DELETE a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (req.user.role !== 'Manager') {
      return res.status(401).json({ message: 'Access denied. You are not authorized to delete this task.' });
    }

    await task.destroy();
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete task. Please try again later.' });
  }
};
