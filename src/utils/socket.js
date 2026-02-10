const SocketIO = require("socket.io");
const Message = require("../models/message");

const initialSocket = (server) => {
    const io = SocketIO(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                process.env.FRONTEND_URL
            ].filter(Boolean),
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("a user connected", socket.id);
        socket.on("joinChat", async (userId, id) => {
            const roomId = [userId, id].sort().join("_");
            socket.join(roomId);

            const messages = await Message.find({ roomId });
            socket.emit("chatHistory", messages);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected", socket.id);
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

    });

    return io;

}

module.exports = initialSocket;