const axios = require("axios");
const HttpError = require("../Models/http-error");
const Project = require("../Models/project-model");
const { validationResult } = require("express-validator");

const getProjects = async(req, res, next) => {
  try {
      let projects;
      try {
          projects = await Project.find({});
      } catch(err) {
          return next(new HttpError(err.message));
      }
  } catch(err) {
    return next(new HttpError(err.message));
  }

  res.send({ projects: projects.map(project => project.toObject({ getters: true })) });
};

const createProject = async(req, res, next) => {
  const { errors } = validationResult(req);

  if (errors.length) {
    return next(new HttpError("Invalid inputs.", 422));
  }

  const { repo, title, owner, description, keywords } = req.body;

  try {
    const response = await Project.find({ repo });
    if (response && response.owner === owner) {
      return next(new HttpError("Repo already exists", 422));
    }
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  const newProject = new Project({
    repo,
    owner,
    keywords,
    description: description || new Array(0),
  });

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
