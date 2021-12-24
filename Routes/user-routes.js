const router = require("express").Router();
const usersControllers = require("../Controllers/users-controllers");

router.get("/", usersControllers.getUser);
router.post("/", usersControllers.authenticateUser);

module.exports = router;