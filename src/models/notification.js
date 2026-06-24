const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, index: true },
    senderId: { type: String },
    senderName: { type: String },
    type: { type: String, required: true }, // "message" | "connection_request" | "call"
    title: { type: String },
    body: { type: String },
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
