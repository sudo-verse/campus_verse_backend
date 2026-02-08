const express = require("express");
const auth = require("../middlewares/auth");
const requestRouter = express.Router();
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

requestRouter.post("/request/send/:status/:id", auth, async (req, res) => {
  try {
    const { id: toUserId, status } = req.params;
    const fromUserId = req.user._id;

    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send("Invalid request");
    }

    const isToUserExist = await User.findById(toUserId);
    if (!isToUserExist) {
      return res.status(400).json({ message: "User not exist" });
    }

    const isSent = await connectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (isSent) {
      return res.status(400).send("Connection Request already exists!!!");
    }

    const ConnectionRequest = new connectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    await ConnectionRequest.save();

    // ✅ Send response ONCE
    res.send("Sent");
    (async () => {
      try {
        const subject = `New Connection Request from ${req.user.name}`;
        const body = `${req.user.name} is ${status} in connecting with you!`;
        const sesRes = await sendEmail.run(subject, body, isToUserExist.email, req.user.email);
        console.log("SES Response:", sesRes);
      } catch (err) {
        console.error("Email failed:", err.message);
      }
    })();
  } catch (err) {
    return res.status(500).send(`Error: ${err.message}`);
  }
});

requestRouter.post("/request/review/:status/:id", auth, async (req, res) => {
  try {
    const loginUserId = req.user._id;
    const { id: fromUserId, status } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send("Invalid request");
    }

    const request = await connectionRequest.findOne({
      fromUserId,
      toUserId: loginUserId,
      status: "interested",
    });

    if (!request) {
      return res.status(400).send("No such request found");
    }

    request.status = status;
    const data = await request.save();

    return res.json({
      message: `Request ${status} successfully`,
      data,
    });
  } catch (err) {
    return res.status(500).send(`Error: ${err.message}`);
  }
});

module.exports = requestRouter;
