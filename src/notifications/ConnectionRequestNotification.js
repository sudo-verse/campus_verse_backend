const Notification = require("./Notification");

class ConnectionRequestNotification extends Notification {
  constructor({ recipientId, senderId, senderName, status } = {}) {
    super({ recipientId, senderId, senderName });
    this.status = status; // "interested" | "accepted"
  }

  get type() {
    return "connection_request";
  }

  getTitle() {
    return this.status === "accepted"
      ? `${this.senderName || "Someone"} accepted your request`
      : `New connection request from ${this.senderName || "someone"}`;
  }

  getBody() {
    return this.status === "accepted"
      ? "You're now connected!"
      : "Wants to connect with you";
  }

  getSound() {
    return "request";
  }

  toPayload() {
    return {
      ...super.toPayload(),
      status: this.status,
    };
  }
}

module.exports = ConnectionRequestNotification;
