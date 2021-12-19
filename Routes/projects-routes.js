const router = require("express").Router();
const placesControllers = require("../Controllers/projects-controllers");

router.get("/", placesControllers.getProjects);
router.get("/:pid", placesControllers.getProjectByRepo);

module.exports = router;