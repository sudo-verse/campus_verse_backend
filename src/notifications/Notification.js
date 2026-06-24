// Base notification. Subclasses set `type` and getTitle(); body/sound are optional.
class Notification {
  constructor({ recipientId, senderId, senderName } = {}) {
    if (new.target === Notification) {
      throw new Error("Notification is abstract and cannot be instantiated directly");
    }
    this.recipientId = recipientId;
    this.senderId = senderId;
    this.senderName = senderName;
    this.createdAt = new Date();
  }

  get type() {
    throw new Error("Subclasses must define a `type`");
  }

  getTitle() {
    throw new Error("getTitle() must be implemented by a subclass");
  }

  getBody() {
    return "";
  }

  getSound() {
    return "default";
  }

  toPayload() {
    return {
      type: this.type,
      title: this.getTitle(),
      body: this.getBody(),
      sound: this.getSound(),
      recipientId: this.recipientId,
      senderId: this.senderId,
      senderName: this.senderName,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Notification;
