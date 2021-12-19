const axios = require("axios");
const HttpError = require("../Models/http-error");

const getProjects = (req, res, next) => {
    res.status(200).json({ projects: [] })
}

exports.getProjects = getProjects;