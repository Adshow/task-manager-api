const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");
const { USER_ROLES } = require("../constants");

const User = sequelize.define("User", {
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
    type: DataTypes.ENUM(...Object.values(USER_ROLES)),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
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
  foreignKey: "managerId",
  as: "manager",
});

// Hash the password before saving the user
User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
});

// Create the User table in the database
User.sync()
  .then(() => {
    console.log("User table created successfully");
  })
  .catch((error) => {
    console.error("Error creating User table:", error);
  });

module.exports = User;
