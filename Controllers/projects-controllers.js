const axios = require("axios");
const HttpError = require("../Models/http-error");

const getProjects = (req, res, next) => {
    res.status(200).json({ projects: [] })
}

const getProjectByRepo = async(req, res, next) => {
    const { pid } = req.params;
    try {
        const response = await axios.get(`https://api.github.com/repos/mars/create-react-app-buildpack/pulls`, {
            params: {
                per_page: 100,
                state: "all"
            }
        })
        const resData = response.data;
        console.log(resData);
        return res.json({ pulls: resData.length })
    } catch(err) {
        return next(new HttpError(err.message, 500));
    }
}

exports.getProjects = getProjects;
exports.getProjectByRepo = getProjectByRepo;