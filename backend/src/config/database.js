const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/adote-um-amigo";
  await mongoose.connect(uri);
  console.log("Backend connected to MongoDB");
}

module.exports = connectDatabase;
