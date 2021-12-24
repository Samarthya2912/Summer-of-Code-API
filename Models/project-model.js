const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  description: { type: String },
  keywords: [{ type: String }],
});

module.exports = mongoose.model("Project", projectSchema);
