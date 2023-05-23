const Task = require("../models/Task");

const findTasksByUserId = async (id) =>
  await Task.findAll({ where: { userId: id } });

const findTasks = async () => await Task.findAll();

const findTaskById = async (id) => await Task.findByPk(id);

const createTask = async (summary, datePerformed, id) =>
  await Task.create({
    summary,
    datePerformed,
    userId: id,
  });

module.exports = { findTasks, findTasksByUserId, createTask, findTaskById };
