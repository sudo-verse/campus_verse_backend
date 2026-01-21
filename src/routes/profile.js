const express = require("express");
const profileRouter = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validatePassword } = require("../utils/validate");

profileRouter.get("/profile/view", auth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(401).send("Unauthorized : " + err.message);
  }
});
profileRouter.patch("/profile/edit", auth, async (req, res) => {
  const id = req.user._id;
  if (req.body.password)
    return res.status(400).send("Password cannot be changed from here");
  try {
    const user = await User.findOneAndUpdate({ _id: id }, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});
profileRouter.patch("/profile/edit/password", auth, async (req, res) => {
  const id = req.user._id;
  const { password, newPassword } = req.body;
  try {
    validatePassword(newPassword);
    if (!password || !newPassword) {
      return res.status(400).send("Current and new password are required");
    }
    const isMatch = await bcrypt.compare(password, req.user.password);
    if (!isMatch) return res.status(400).send("Wrong Password");
    else {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const user = await User.findOneAndUpdate(
        { _id: id },
        { password: passwordHash },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );
      res.send(user);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = profileRouter;
