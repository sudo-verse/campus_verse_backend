const SocketEventHandler = require("./SocketEventHandler");
const { CallNotification } = require("../../notifications");

class CallSignalingHandler extends SocketEventHandler {
  register(socket) {
    socket.on("callUser", ({ from, to, offer, callerName, callerPhoto, callType }) => {
      const targetSocketId = this.connectedUsers.get(to);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("incomingCall", {
          from,
          offer,
          callerName,
          callerPhoto,
          callType, // "audio" or "video"
        });
        console.log(`📞 Call from ${from} → ${to} (${callType})`);

        this.notifications.dispatch(
          new CallNotification({
            recipientId: to,
            senderId: from,
            senderName: callerName,
            callType,
          })
        );
      } else {
        socket.emit("callFailed", { reason: "User is offline" });
        console.log(`📞 Call failed: ${to} is offline`);
      }
    });

    socket.on("answerCall", ({ to, answer }) => {
      const targetSocketId = this.connectedUsers.get(to);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("callAnswered", { answer });
        console.log(`📞 Call answered → ${to}`);
      }
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      const targetSocketId = this.connectedUsers.get(to);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("iceCandidate", { candidate });
      }
    });

    socket.on("endCall", ({ to }) => {
      const targetSocketId = this.connectedUsers.get(to);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("callEnded");
        console.log(`📞 Call ended → ${to}`);
      }
    });

    socket.on("rejectCall", ({ to }) => {
      const targetSocketId = this.connectedUsers.get(to);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("callRejected");
        console.log(`📞 Call rejected → ${to}`);
      }
    });
  }
}

module.exports = CallSignalingHandler;
