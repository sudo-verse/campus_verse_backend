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
    isVerified: {
      type: Boolean,
      default: false
    },

    verificationToken: String,
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
        if (["Male", "Female", "Other"].includes(value) === false) {
          throw new Error("Gender must be Male,Female or Other");
        }
      },
    },
    about: {
      type: String,
      default: "i am a software developer",
    },
    membershipType: {
      type: String,
    },
    membershipStatus: {
      type: String,
      default: "inactive",
    },
    photoUrl: {
      type: String,

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
