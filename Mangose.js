const mongoose = require("mongoose");

const { Schema } = mongoose;

async function main() {
 await mongoose.connect(
    "mongodb+srv://imfirozz:Firoz%400620%40@codex.ugo00ej.mongodb.net/BookStore",
  );

  
}

module.exports = main;


