const express = require("express");
const notificationRouter = express.Router();
const auth = require("../middlewares/auth");
const Notification = require("../models/notification");

// List the most recent notifications for the logged-in user.
notificationRouter.get("/notifications", auth, async (req, res) => {
  try {
    const recipientId = String(req.user._id);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipientId,
      read: false,
    });

    res.json({ data: notifications, unreadCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Unread count only (cheap poll / badge refresh).
notificationRouter.get("/notifications/unread-count", auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientId: String(req.user._id),
      read: false,
    });
    res.json({ unreadCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark every notification read.
notificationRouter.patch("/notifications/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: String(req.user._id), read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked read" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark a single notification read (must belong to the caller).
notificationRouter.patch("/notifications/:id/read", auth, async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: String(req.user._id) },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = notificationRouter;
