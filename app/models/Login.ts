import mongoose from "mongoose";

const LoginSchema = new mongoose.Schema({

  email: String,

  token: String,

  createdAt: {
    type: Date,
    default: Date.now,
  }

});

export default mongoose.models.Login ||
  mongoose.model("Login", LoginSchema);