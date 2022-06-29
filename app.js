const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const placesRoutes = require("./Routes/projects-routes");
const usersRoutes = require("./Routes/user-routes");
const { test } = require("./Controllers/metric-update-controller");
const cron = require("node-cron");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/api/projects", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "Unexpected error occured!" });
});

mongoose
  .connect(process.env.DB_URI)
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log(`SERVER STARTED ON PORT ${process.env.PORT}.`);
      cron.schedule("* * * * *", test);
    })
  )
  .catch((err) => console.log("Error: " + err.message));
