const SocketEventHandler = require("./SocketEventHandler");
const Message = require("../../models/message");
const { MessageNotification } = require("../../notifications");

class ChatHandler extends SocketEventHandler {
  register(socket) {
    socket.on("joinChat", async (userId, id) => {
      const roomId = this.roomIdFor(userId, id);
      socket.join(roomId);

      if (userId) {
        this.connectedUsers.set(userId, socket.id);
      }

      const messages = await Message.find({ roomId });
      socket.emit("chatHistory", messages);
    });

    socket.on("sendMessage", async (userId, id, message) => {
      const roomId = this.roomIdFor(userId, id);
      console.log(userId, id, message);

      socket.broadcast.to(roomId).emit("receiveMessage", {
        text: message,
        sender: userId,
        createdAt: new Date(),
      });

      await Message.create({
        roomId,
        sender: userId,
        text: message,
        createdAt: new Date(),
      });

      this.notifications.dispatch(
        new MessageNotification({
          recipientId: id,
          senderId: userId,
          preview: message,
        })
      );
    });
  }
}

module.exports = ChatHandler;
