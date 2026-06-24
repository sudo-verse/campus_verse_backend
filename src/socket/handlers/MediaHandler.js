const SocketEventHandler = require("./SocketEventHandler");
const Message = require("../../models/message");
const { MessageNotification } = require("../../notifications");

class MediaHandler extends SocketEventHandler {
  register(socket) {
    socket.on("sendMedia", async (userId, id, mediaUrl, mediaType, caption) => {
      const roomId = this.roomIdFor(userId, id);
      console.log("Media:", userId, id, mediaType, mediaUrl);

      const msgData = {
        text: caption || "",
        mediaUrl,
        mediaType,
        sender: userId,
        createdAt: new Date(),
      };

      socket.broadcast.to(roomId).emit("receiveMessage", msgData);
      await Message.create({ roomId, ...msgData });

      this.notifications.dispatch(
        new MessageNotification({
          recipientId: id,
          senderId: userId,
          preview: caption,
          mediaType,
        })
      );
    });
  }
}

module.exports = MediaHandler;
