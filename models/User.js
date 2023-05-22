const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Manager', 'Technician'),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

// Define the association between User and Manager (self-association)
User.belongsTo(User, {
  foreignKey: 'managerId',
  as: 'manager',
});

// Hash the password before saving the user
User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
});

User.beforeCreate((user) => {
  if (user.role === 'Technician' && !user.managerId) {
    throw new Error('Technician user must have a manager ID');
  }
});

// Create the User table in the database
User.sync()
  .then(() => {
    console.log('User table created successfully');
  })
  .catch((error) => {
    console.error('Error creating User table:', error);
  });

module.exports = User;

