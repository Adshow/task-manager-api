const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const tasksRouter = require('./routes/taskRoute');
const usersRouter = require('./routes/userRoute');
const loginRouter = require('./routes/loginRoute');

const authenticateUser = require('./middlewares/auth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/login', loginRouter);
app.use('/users', usersRouter);

// Apply authentication middleware to all routes except login and create user
app.use(authenticateUser);
app.use('/tasks', tasksRouter);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = server;