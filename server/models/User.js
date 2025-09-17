import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  userName: String,
  userEmail: String,
  password: String,
  role: String,
  resetToken: { type: String },
  resetTokenExpiry: { type: Date }
});

export default model("User", UserSchema);
