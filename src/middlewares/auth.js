const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Authentication Invalid");
    }
    const decode = jwt.verify(token, "dev123");
    const user = await User.findById(decode.id);
    if (!user) {
      throw new Error("Authentication Invalid");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = auth;
