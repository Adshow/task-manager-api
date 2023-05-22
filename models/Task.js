const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 2500],
    },
  },
  datePerformed: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Define the association between Task and User
Task.belongsTo(User, { foreignKey: 'userId' });

// Create the Task table in the database
Task.sync()
  .then(() => {
    console.log('Task table created successfully');
  })
  .catch((error) => {
    console.error('Error creating Task table:', error);
  });

module.exports = Task;
