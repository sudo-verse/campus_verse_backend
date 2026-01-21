const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
    },
    email: {
      type: String,

      required: true,
      unique: true,
      validate(value) {
        if (validator.isEmail(value) === false) {
          throw new Error("email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (validator.isStrongPassword(value) === false) {
          throw new Error("password is not strong enough");
        }
      },
    },
    gender: {
      type: String,
      required: true,
      validate(value) {
        if (["male", "female", "other"].includes(value) === false) {
          throw new Error("gender must be male,female or other");
        }
      },
    },
    about: {
      type: String,
      default: "i am a software developer",
    },
    photoUrl:{
      type: String,
      default: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372622/devashish_gcm794.jpg"
    }
  },
  {
    timestamps: true,
  }
);
userSchema.methods.getJWT = async function () {
  return await jwt.sign({ id: this._id }, "dev123", {
    expiresIn: "1d",
  });
};
const User = mongoose.model("User", userSchema);
module.exports = User;
