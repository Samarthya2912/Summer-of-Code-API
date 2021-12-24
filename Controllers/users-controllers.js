const axios = require("axios");
const HttpError = require("../Models/http-error");

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

      if(userData === null || userData === undefined) {
          return next(new HttpError("No user found.", 404))
      } else return res.json({ userData })
  } catch(err) {
      return next(new HttpError(err.message))
  }
}

exports.authenticateUser = authenticateUser;
