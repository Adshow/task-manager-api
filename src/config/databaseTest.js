const { Sequelize } = require('sequelize');

const sequelizeTest = new Sequelize(process.env.DB_TEST_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
});

module.exports = sequelizeTest;
