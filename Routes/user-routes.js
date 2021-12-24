const router = require("express").Router();
const usersControllers = require("../Controllers/users-controllers");

router.post("/", usersControllers.authenticateUser);

module.exports = router;