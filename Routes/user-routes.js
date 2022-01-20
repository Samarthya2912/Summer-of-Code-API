const router = require("express").Router();
const { header, body } = require("express-validator");
const usersControllers = require("../Controllers/users-controllers");

router.get("/", [header("authorization").notEmpty()], usersControllers.getUser);

router.post("/", [body("code").notEmpty()], usersControllers.authenticateUser);

module.exports = router;
