const router = require("express").Router();
const placesControllers = require("../Controllers/projects-controllers");

router.get("/", placesControllers.getProjects);

module.exports = router;