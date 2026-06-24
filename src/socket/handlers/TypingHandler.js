const SocketEventHandler = require("./SocketEventHandler");

class TypingHandler extends SocketEventHandler {
  register(socket) {
    socket.on("typing", (userId, id) => {
      const roomId = this.roomIdFor(userId, id);
      socket.broadcast.to(roomId).emit("userTyping", userId);
    });

    socket.on("stopTyping", (userId, id) => {
      const roomId = this.roomIdFor(userId, id);
      socket.broadcast.to(roomId).emit("userStopTyping", userId);
    });
  }
}

module.exports = TypingHandler;
