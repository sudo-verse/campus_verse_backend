const SocketEventHandler = require("./SocketEventHandler");

class PresenceHandler extends SocketEventHandler {
  register(socket) {
    socket.on("registerUser", (userId) => {
      if (userId) {
        this.connectedUsers.set(userId, socket.id);
        console.log(`📞 User registered: ${userId} → ${socket.id}`);
        this.broadcastOnlineUsers();
      }
    });

    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", Array.from(this.connectedUsers.keys()));
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      for (const [userId, sockId] of this.connectedUsers.entries()) {
        if (sockId === socket.id) {
          this.connectedUsers.delete(userId);
          console.log(`📞 User unregistered: ${userId}`);
          break;
        }
      }
      this.broadcastOnlineUsers();
    });
  }
}

module.exports = PresenceHandler;
