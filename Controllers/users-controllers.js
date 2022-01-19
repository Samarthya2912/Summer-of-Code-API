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
  } catch (err) {
    return next(new HttpError(err.message, 404));
  }
  console.log("payload", payload);

  let userData = null;
  try {
    const response = await axios({
      method: "get",
      url: `https://api.github.com/users/${payload.login}`,
    });

    userData = response.data;
  } catch (err) {
    return next(new HttpError(err.message));
  }

  if (!userData) return next(new HttpError("Invalid user", 404));
  res.json({ userData });
}

async function authenticateUser(req, res, next) {
  let access_token = null;
  try {
    const response = await axios({
      url: "https://github.com/login/oauth/access_token",
      method: "post",
      data: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: req.body.code,
      },
      headers: { Accept: "application/json" },
    });

    access_token = response.data.access_token;
    console.log("token", access_token);

    if (access_token === null || access_token === undefined)
      return next(new HttpError("Token not generated.", 404));
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  let userData = null;
  try {
    const response = await axios({
      method: "get",
      url: "https://api.github.com/user",
      headers: { Authorization: `token ${access_token}` },
    });

    userData = response.data;
    console.log("User data", userData);

    if (userData === null || userData === undefined)
      return next(new HttpError("No user found.", 404));

    const newUser = new User({
      id: userData.id,
      login: userData.login,
    });

    const identifiedUser = await User.findOne({
      id: userData.id,
      login: userData.login,
    });

    if (!identifiedUser) {
      await newUser.save();
      console.log("Saving the user as it doesn't exist.");
    }

    const token = jwt.sign(
      { id: userData.id, login: userData.login, github_access_token: access_token },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({ token, userData });
  } catch (err) {
    return next(new HttpError(err.message));
  }
}

exports.getUser = getUser; // verifies the token and returns the userdata (id,login...)
exports.authenticateUser = authenticateUser; // creates a github token and json web token for user and saves in db if user doesn't already exist
