const axios = require("axios");
const HttpError = require("../Models/http-error");
const Project = require("../Models/project-model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

/* return an array of all projects in the format {projects: []} */
const getProjects = async (req, res, next) => {
  let projects;
  try {
    projects = await Project.find({});
  } catch (err) {
    return next(new HttpError(err.message));
  }

  res.send({
    projects: projects.map((project) => project.toObject({ getters: true })),
  });
};

/* creates a project and sends back with the created document */
const createProject = async (req, res, next) => {
  const { errors } = validationResult(req);

  if (errors.length) {
    return next(new HttpError("Invalid inputs.", 422));
  }

  const { repo, owner, keywords, description } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new HttpError(err.message, 404));
  }

  let projectData = {
    repo,
    owner,
    keywords,
    description,
    creator: payload.login,
  };
  try {
    const response = await axios({
      url: `https://api.github.com/repos/${owner}/${repo}`,
    });

    if (response.statusText === "OK") {
      projectData = {
        ...projectData,
        page_views: 0,
        clone_count: 0,
        forks: 0,
        open_issues: 0,
        languages: {},
        last_update: Date.now(),
      };
    }
  } catch (err) {
    return next(new HttpError(err.message));
  }

  try {
    const identifiedProjects = await Project.find({ repo, owner });
    if (identifiedProjects.length)
      return next(new HttpError("Project already exists.", 409));
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  let newProject = new Project({ ...projectData });
  let createdProject;
  try {
    createdProject = await newProject.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res
    .status(201)
    .json({ createProject: createdProject.toObject({ getters: true }) });
};

exports.getProjects = getProjects;
exports.createProject = createProject;
