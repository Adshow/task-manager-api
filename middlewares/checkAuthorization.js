const Task = require('../models/Task');

const checkAuthorization = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId !== req.user.id && req.user.role !== 'Manager') {
      return res.status(401).json({ message: 'Access denied' });
    }

    req.task = task;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = checkAuthorization;
