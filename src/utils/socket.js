const SocketIO = require("socket.io");
const Message = require("../models/message");

// Map userId -> socketId for routing call signals
const connectedUsers = new Map();

const initialSocket = (server) => {
    const io = SocketIO(server, {
        cors: {
            origin: "https://campusverse.duckdns.org",
            methods: ["GET", "POST"],
        },
    });

    // Debug connection errors
    io.engine.on("connection_error", (err) => {
        console.log("Socket Connection Error:", err.req.url);
        console.log("Error details:", err.code, err.message, err.context);
    });
    io.on("connection", (socket) => {
        console.log("a user connected", socket.id);

        // ── Register user for call routing ──
        socket.on("registerUser", (userId) => {
            if (userId) {
                connectedUsers.set(userId, socket.id);
                console.log(`📞 User registered: ${userId} → ${socket.id}`);
            }
        });

        socket.on("joinChat", async (userId, id) => {
            const roomId = [userId, id].sort().join("_");
            socket.join(roomId);

            // Also register user mapping every time they join a chat
            if (userId) {
                connectedUsers.set(userId, socket.id);
            }

            const messages = await Message.find({ roomId });
            socket.emit("chatHistory", messages);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected", socket.id);
            // Remove user from connected map
            for (const [userId, sockId] of connectedUsers.entries()) {
                if (sockId === socket.id) {
                    connectedUsers.delete(userId);
                    console.log(`📞 User unregistered: ${userId}`);
                    break;
                }
            }
        });

        socket.on("sendMessage", async (userId, id, message) => {
            const roomId = [userId, id].sort().join("_");
            console.log(userId, id, message);
            socket.broadcast.to(roomId).emit("receiveMessage", {
                text: message,
                sender: userId,
                createdAt: new Date()
            });
            await Message.create({
                roomId,
                sender: userId,
                text: message,
                createdAt: new Date()
            });
        });

        socket.on("typing", (userId, id) => {
            const roomId = [userId, id].sort().join("_");
            socket.broadcast.to(roomId).emit("userTyping", userId);
        });

        socket.on("stopTyping", (userId, id) => {
            const roomId = [userId, id].sort().join("_");
            socket.broadcast.to(roomId).emit("userStopTyping", userId);
        });

        // ── WebRTC Signaling Events ──

        // Caller sends an offer to the target user
        socket.on("callUser", ({ from, to, offer, callerName, callerPhoto, callType }) => {
            const targetSocketId = connectedUsers.get(to);
            if (targetSocketId) {
                io.to(targetSocketId).emit("incomingCall", {
                    from,
                    offer,
                    callerName,
                    callerPhoto,
                    callType, // "audio" or "video"
                });
                console.log(`📞 Call from ${from} → ${to} (${callType})`);
            } else {
                // Target user is offline
                socket.emit("callFailed", { reason: "User is offline" });
                console.log(`📞 Call failed: ${to} is offline`);
            }
        });

        // Callee answers the call with their SDP answer
        socket.on("answerCall", ({ to, answer }) => {
            const targetSocketId = connectedUsers.get(to);
            if (targetSocketId) {
                io.to(targetSocketId).emit("callAnswered", { answer });
                console.log(`📞 Call answered → ${to}`);
            }
        });

        // Exchange ICE candidates
        socket.on("iceCandidate", ({ to, candidate }) => {
            const targetSocketId = connectedUsers.get(to);
            if (targetSocketId) {
                io.to(targetSocketId).emit("iceCandidate", { candidate });
            }
        });

        // End the call
        socket.on("endCall", ({ to }) => {
            const targetSocketId = connectedUsers.get(to);
            if (targetSocketId) {
                io.to(targetSocketId).emit("callEnded");
                console.log(`📞 Call ended → ${to}`);
            }
        });

        // Reject / decline the call
        socket.on("rejectCall", ({ to }) => {
            const targetSocketId = connectedUsers.get(to);
            if (targetSocketId) {
                io.to(targetSocketId).emit("callRejected");
                console.log(`📞 Call rejected → ${to}`);
            }
        });

    });

    return io;

}

module.exports = initialSocket;