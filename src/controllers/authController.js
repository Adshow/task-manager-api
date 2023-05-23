const { authenticateUser } = require("../facades/authFacade");

//Authenticate the user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const token = await authenticateUser(email, password);

  return res.json({ auth: true, token });
};

module.exports = {
  loginUser,
};
