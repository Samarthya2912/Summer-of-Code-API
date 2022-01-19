const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  description: { type: String },
  keywords: [{ type: String }],
  page_views: { type: Number },
  clone_count: { type: Number },
  forks: { type: Number },
  open_issues: { type: Number },
  languages: { type: Object },
  last_update: { type: Date }
});

module.exports = mongoose.model("Project", projectSchema);
