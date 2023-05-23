const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const checkTaskAuthorization = require("../middlewares/checkTaskAuthorization");

// GET all tasks
router.get("/", taskController.getAllTasks);

// GET a task by ID
router.get("/:id", checkTaskAuthorization, taskController.getTaskById);

// CREATE a new task
router.post("/", taskController.createTask);

// UPDATE a task
router.put("/:id", checkTaskAuthorization, taskController.updateTask);

// DELETE a task
router.delete("/:id", checkTaskAuthorization, taskController.deleteTask);

module.exports = router;
