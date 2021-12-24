const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const placesRoutes = require("./Routes/projects-routes");
const usersRoutes = require("./Routes/user-routes");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
  .then(() => app.listen(5000, () => console.log("SERVER STARTED ON PORT 5000.")))
  .catch((err) => console.log("Error: " + err.message));
