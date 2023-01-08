import Movie from "./movie";
import { model, Schema } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String },
  registerDate: { type: Date, required: true, default: Date.now },
  shows_list: { type: [Movie], default: [] },
  avatar_link: { type: String },
});

export default model("User", userSchema);
