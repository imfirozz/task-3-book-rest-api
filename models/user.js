const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    age: Number,
    gender: String,
    distric: String,
    pincode: Number,
    state: String,
  });

 const Model = mongoose.model("users", userSchema);

module.exports = Model;