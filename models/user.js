const mongoose = require("mongoose");
const { Movie } = require("./movie");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String },
  registerDate: { type: Date, required: true, default: Date.now },
  shows_list: { type: [Movie], default: [] },
  avatar_link: { type: String },
});

module.exports = mongoose.model("User", userSchema);
