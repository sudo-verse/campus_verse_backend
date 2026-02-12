const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const connectionRequest = require("../models/connectionRequest");
const auth = require("../middlewares/auth");
const userString = "name gender about photoUrl";
userRouter.get("/user/request/received", auth, async (req, res) => {
  try {
    const loginUserId = req.user._id;
    const users = await connectionRequest.find({
      toUserId: loginUserId,
      status: "interested"
    }).populate("fromUserId", userString);
    res.send(users);
  } catch (err) {
    res.status(400).send("Error : ", err.message);
  }
});
userRouter.get("/user/connections", auth, async (req, res) => {
  try {
    const loginUserId = req.user._id;
    const connections = await connectionRequest.find({
      $or: [
        { fromUserId: loginUserId },
        { toUserId: loginUserId }
      ],
      status: "accepted"
    }).populate("fromUserId toUserId", userString);

    const data = connections.map(conn => {
      if (conn.fromUserId._id.equals(loginUserId)) {
        return conn.toUserId;
      } else {
        return conn.fromUserId;
      }
    });
    res.send(data);
  } catch (err) {
    res.status(400).send("Error : ", err.message);
  }
});
// Get a single user's profile by ID (with connection status)
userRouter.get("/user/profile/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(userString);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check existing connection/request status
    const existingRequest = await connectionRequest.findOne({
      $or: [
        { fromUserId: req.user._id, toUserId: id },
        { fromUserId: id, toUserId: req.user._id },
      ],
    });

    let connectionStatus = "none"; // no interaction yet
    if (existingRequest) {
      connectionStatus = existingRequest.status; // "interested", "ignored", "accepted", "rejected"
      if (existingRequest.status === "interested") {
        // Differentiate: did I send it or did they?
        connectionStatus = existingRequest.fromUserId.equals(req.user._id)
          ? "request_sent"
          : "request_received";
      }
    }

    res.json({ data: { ...user.toObject(), connectionStatus } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Search users by name
userRouter.get("/user/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json({ data: [] });
    }

    // Sanitize query to prevent regex injection
    const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await User.find({
      name: { $regex: sanitized, $options: "i" },
      _id: { $ne: req.user._id }, // Exclude self
    })
      .select(userString)
      .limit(10);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/user/feed", auth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await connectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(userString)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;