const NotificationModel = require("../models/notification");

// Saves a notification and pushes it to the recipient if they're online.
class NotificationService {
  constructor(io, connectedUsers) {
    this.io = io;
    this.connectedUsers = connectedUsers; // Map<userId, socketId>
  }

  async dispatch(notification) {
    const payload = notification.toPayload();

    try {
      await NotificationModel.create({
        recipientId: String(notification.recipientId),
        senderId: notification.senderId ? String(notification.senderId) : undefined,
        senderName: notification.senderName,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        meta: payload,
      });
    } catch (err) {
      console.error("Notification persist failed:", err.message);
    }

    const socketId = this.connectedUsers.get(String(notification.recipientId));
    if (socketId) {
      this.io.to(socketId).emit("notification", payload);
    }
  }
}

module.exports = NotificationService;
