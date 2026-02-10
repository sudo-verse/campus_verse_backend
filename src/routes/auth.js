const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user");
const { sendVerificationEmail } = require("../utils/emailVerify");
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const { name, email, password, gender, about, photoUrl } = req.body;
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: passwordHash,
      gender,
      about,
      photoUrl,
      isVerified: false,
      verificationToken
    });
    await user.save();
    const verifyLink = `https://campusverse.duckdns.org/api/verify-email/${verificationToken}`;

    await sendVerificationEmail(email, verifyLink);
    res.send("Signup successful. Please check your email to verify your account.");
  } catch (error) {
    res.status(400).send(error.message);
  }
});
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid Credentials");
    if (!user.isVerified) {
      return res.status(403).send("Please verify your email first");
    }
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
authRouter.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).send("Invalid or expired link");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.redirect("https://campusverse.duckdns.org/login");
});


module.exports = authRouter;
