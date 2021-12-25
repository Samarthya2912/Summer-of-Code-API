const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  login: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("User", userSchema);
