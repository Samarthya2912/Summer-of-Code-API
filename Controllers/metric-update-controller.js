const { default: axios } = require("axios");
const HttpError = require("../Models/http-error");
const Project = require("../Models/project-model");
const dotenv = require("dotenv").config();

async function test() {
  let projects = null;
  try {
    projects = await Project.find({});
  } catch (err) {
    return next(new HttpError(err.message + ". Error in fetching projects"));
  }

  let maxAgedProject = projects[0];
  for (let project of projects) {
    if (maxAgedProject.last_update > project.last_update) {
      maxAgedProject = project;
    }
  }

  try {
    const response = await axios({
      method: "GET",
      url: `https://api.github.com/repos/${maxAgedProject.owner}/${maxAgedProject.repo}/traffic/views`,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${process.env.ADMIN_GITHUB_ACCESS_TOKEN}`,
      },
    });

    if(response.statusText === "OK") maxAgedProject.page_views = response.data.count;
    else return next(new HttpError(err.message));
  } catch (err) {
    return next(new HttpError(err.message));
  }

  try {
    const response = await axios({
      method: "GET",
      url: `https://api.github.com/repos/${maxAgedProject.owner}/${maxAgedProject.repo}/traffic/clones`,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${process.env.ADMIN_GITHUB_ACCESS_TOKEN}`,
      },
    });

    if(response.statusText === "OK") maxAgedProject.clone_count = response.data.count;
    else return next(new HttpError(err.message));
  } catch (err) {
    return next(new HttpError(err.message));
  }

  try {
    const response = await axios({
      method: "GET",
      url: `https://api.github.com/repos/${maxAgedProject.owner}/${maxAgedProject.repo}`,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${process.env.ADMIN_GITHUB_ACCESS_TOKEN}`,
      },
    });

    if(response.statusText === "OK") {
        maxAgedProject.forks = response.data.forks_count;
        maxAgedProject.open_issues = response.data.open_issues_count;
        maxAgedProject.language = response.data.language;
    }
    else return next(new HttpError(err.message));
  } catch (err) {
    return next(new HttpError(err.message));
  }

  try {
    const response = await axios({
      method: "GET",
      url: `https://api.github.com/repos/${maxAgedProject.owner}/${maxAgedProject.repo}/languages`,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${process.env.ADMIN_GITHUB_ACCESS_TOKEN}`,
      },
    });

    if(response.statusText === "OK") maxAgedProject.languages = response.data;
    else return next(new HttpError(err.message));
  } catch (err) {
    return next(new HttpError(err.message));
  }

  try {
    maxAgedProject.last_update = Date.now();
    const response = await maxAgedProject.save();
    console.log("saved", response);
  } catch (err) {
    return next(new HttpError(err.message + ". Error in updating project."));
  }
}

exports.test = test;
