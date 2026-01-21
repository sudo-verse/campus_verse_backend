const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    "mongodb+srv://ashishkrguptahajipur_db_user:dev2025@devverse.opmql35.mongodb.net/?retryWrites=true&w=majority&appName=DevVerse"
  );
};
module.exports = connectDb;
