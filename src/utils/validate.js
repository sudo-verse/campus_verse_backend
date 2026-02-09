const validator = require("validator");

const validateSignupData = (req) => {
  const { name, email, password, gender } = req.body;
  if (!name) throw new Error("name is required");
  if (validator.isEmail(email) === false) throw new Error("emailId is invalid");
  if (validator.isStrongPassword(password) === false)
    throw new Error("password is not strong enough");
  if (["Male", "Female", "Other"].includes(gender) === false)
    throw new Error("gender must be Male,Female or Other");
};
const validatePassword = (password) => {
  if (validator.isStrongPassword(password) === false)
    throw new Error("password is not strong enough");
};
module.exports = { validateSignupData, validatePassword };
