// Base class for a group of socket event handlers.
class SocketEventHandler {
  constructor(context) {
    // { io, connectedUsers, notificationService, broadcastOnlineUsers }
    this.context = context;
  }

  get io() {
    return this.context.io;
  }

  get connectedUsers() {
    return this.context.connectedUsers;
  }

  get notifications() {
    return this.context.notificationService;
  }

  broadcastOnlineUsers() {
    this.context.broadcastOnlineUsers();
  }

  roomIdFor(a, b) {
    return [a, b].sort().join("_");
  }

  register(socket) {
    throw new Error(`${this.constructor.name} must implement register(socket)`);
  }
}

module.exports = SocketEventHandler;
