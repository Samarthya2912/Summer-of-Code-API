const router = require("express").Router();
const projectsContollers = require("../Controllers/projects-controllers");
const { body, header } = require("express-validator");

router.get("/", projectsContollers.getProjects);
router.post("/", [
    header("authorization").notEmpty(),
    body("repo").notEmpty(),
    body("owner").notEmpty(),
    body("description").notEmpty(),
]
, projectsContollers.createProject);

module.exports = router;