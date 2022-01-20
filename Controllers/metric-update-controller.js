const { default: axios } = require("axios");
const HttpError = require("../Models/http-error");
const Project = require("../Models/project-model");
const dotenv = require("dotenv").config();

async function test() {
  console.log("attempted metric update");
  let projects = null;
  try {
    projects = await Project.find({});
  } catch (err) {
    console.log(err);
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

    maxAgedProject.page_views = response.data.count;
  } catch (err) {
    console.log(err);
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

    maxAgedProject.clone_count = response.data.count;
  } catch (err) {
    console.log(err);
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

    maxAgedProject.forks = response.data.forks_count;
    maxAgedProject.open_issues = response.data.open_issues_count;
    // maxAgedProject.language = response.data.language;
  } catch (err) {
    console.log(err);
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

    maxAgedProject.languages = response.data;
  } catch (err) {
    console.log(err);
  }

  try {
    maxAgedProject.last_update = Date.now();
    const response = await maxAgedProject.save();
    console.log("saved", response);
  } catch (err) {
    console.log(err);
  }
}

exports.test = test;
