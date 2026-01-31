const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    process.env.MONGODB_URI,
  );
};
module.exports = connectDb;
