const axios = require("axios");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const HttpError = require("../Models/http-error");
const User = require("../Models/user-model");

async function getUser(req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    let payload = null;

    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch(err) {
        return next(new HttpError(err.message, 404));
    }

    let userData = null;
    try {
        const response = await axios({
            method: "get",
            url: `https://api.github.com/users/${payload.login}`
        })
        
        userData = response.data;
    } catch(err) {
        return next(new HttpError(err.message));
    }

    if(!userData) return next(new HttpError("Invalid user", 404));
    res.json({ userData });
}

async function authenticateUser(req, res, next) {
  let access_token = null;
  try {
    const response = await axios({
      url: "https://github.com/login/oauth/access_token",
      method: "post",
      data: {
        client_id: "bf778f87e9514dc519ca",
        client_secret: "5d8913960414065a161b82c3682870f7f8350655",
        code: req.body.code,
      },
      headers: { Accept: "application/json" },
    });

    access_token = response.data.access_token;

    if (access_token === null || access_token === undefined) return next(new HttpError("Token not generated.", 404));
    // else return res.json({ access_token });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  let userData = null;
  try {
      const response = await axios({
          method: "get",
          url: "https://api.github.com/user",
          headers: { Authorization: `token ${access_token}` }
      })

      userData = response.data;

      const newUser = new User({
        id: userData.id,
        login: userData.login
      });

      const identifiedUser = await User.findOne({ id: userData.id, login: userData.login });

      if(!identifiedUser) await newUser.save();

      if(userData === null || userData === undefined) {
          return next(new HttpError("No user found.", 404))
      } else {
          const token = jwt.sign({ id: userData.id ,login: userData.login }, process.env.JWT_SECRET, { expiresIn: "1h" });
          return res.json({ token, userData })
      }
  } catch(err) {
      return next(new HttpError(err.message))
  }
}

exports.getUser = getUser;
exports.authenticateUser = authenticateUser;
