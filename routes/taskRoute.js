const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const checkAuthorization = require('../middlewares/checkAuthorization');

// GET all tasks
router.get('/', taskController.getAllTasks);

// GET a task by ID
router.get('/:id', checkAuthorization, taskController.getTaskById);

// CREATE a new task
router.post('/', taskController.createTask);

// UPDATE a task
router.put('/:id', checkAuthorization, taskController.updateTask);

// DELETE a task
router.delete('/:id', checkAuthorization, taskController.deleteTask);

module.exports = router;
