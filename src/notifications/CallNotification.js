const Notification = require("./Notification");

class CallNotification extends Notification {
  constructor({ recipientId, senderId, senderName, callType } = {}) {
    super({ recipientId, senderId, senderName });
    this.callType = callType; // "audio" | "video"
  }

  get type() {
    return "call";
  }

  getTitle() {
    return `Incoming ${this.callType || ""} call`.replace(/\s+/g, " ").trim();
  }

  getBody() {
    return `${this.senderName || "Someone"} is calling you`;
  }

  getSound() {
    return "ringtone";
  }

  toPayload() {
    return {
      ...super.toPayload(),
      callType: this.callType,
    };
  }
}

module.exports = CallNotification;
