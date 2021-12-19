const express = require("express");
const placesRoutes = require("./Routes/projects-routes");

const app = express();
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

app.use("/api/projects", placesRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "Unexpected error occured!" });
});

app.listen(5000, () => console.log("SERVER STARTED ON PORT 5000."));
