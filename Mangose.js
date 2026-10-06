require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI environment variable is not defined in .env file");
  }

  await mongoose.connect(mongoURI);
}

module.exports = main;
