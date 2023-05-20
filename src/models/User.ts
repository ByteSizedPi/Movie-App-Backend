import { model, Schema } from "mongoose";
import Movie from "./Movie";

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  photoUrl: { type: String },
  registerDate: { type: Date, required: true, default: Date.now },
  shows_list: { type: [Movie], default: [] },
  avatar_link: { type: String },
});

export default model("User", userSchema);
