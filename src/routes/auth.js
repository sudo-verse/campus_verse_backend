const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const User = require("../models/user");
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const { name, email, password, gender, about } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: passwordHash,
      gender,
      about,
    });
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid Credentials");
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = await user.getJWT();
      res.cookie("token", token);
      res.send(user);
    } else {
      res.status(400).send("invalid credentials");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
authRouter.delete("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("logout successful");
});
module.exports = authRouter;
