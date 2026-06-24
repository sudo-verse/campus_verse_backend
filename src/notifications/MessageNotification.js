const Notification = require("./Notification");

class MessageNotification extends Notification {
  constructor({ recipientId, senderId, senderName, preview, mediaType } = {}) {
    super({ recipientId, senderId, senderName });
    this.preview = preview;
    this.mediaType = mediaType;
  }

  get type() {
    return "message";
  }

  getTitle() {
    return `New message from ${this.senderName || "someone"}`;
  }

  getBody() {
    if (this.mediaType) return `Sent a ${this.mediaType}`;
    return this.preview || "";
  }

  getSound() {
    return "message";
  }

  toPayload() {
    return {
      ...super.toPayload(),
      preview: this.preview,
      mediaType: this.mediaType,
    };
  }
}

module.exports = MessageNotification;
