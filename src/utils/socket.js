const SocketIO = require("socket.io");
const NotificationService = require("../services/NotificationService");
const notificationHub = require("../services/notificationHub");

const PresenceHandler = require("../socket/handlers/PresenceHandler");
const ChatHandler = require("../socket/handlers/ChatHandler");
const MediaHandler = require("../socket/handlers/MediaHandler");
const TypingHandler = require("../socket/handlers/TypingHandler");
const CallSignalingHandler = require("../socket/handlers/CallSignalingHandler");

const initialSocket = (server) => {
    const io = SocketIO(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://campusverse.duckdns.org",
            ],
            methods: ["GET", "POST"],
        },
    });

    // Map userId -> socketId for routing call signals / notifications
    const connectedUsers = new Map();
    const notificationService = new NotificationService(io, connectedUsers);
    // Let REST routes reach the same notification service.
    notificationHub.set(notificationService);

    const context = {
        io,
        connectedUsers,
        notificationService,
        broadcastOnlineUsers: () => {
            io.emit("onlineUsers", Array.from(connectedUsers.keys()));
        },
    };

    const handlers = [
        new PresenceHandler(context),
        new ChatHandler(context),
        new MediaHandler(context),
        new TypingHandler(context),
        new CallSignalingHandler(context),
    ];

    // Debug connection errors
    io.engine.on("connection_error", (err) => {
        console.log("Socket Connection Error:", err.req.url);
        console.log("Error details:", err.code, err.message, err.context);
    });

    io.on("connection", (socket) => {
        console.log("a user connected", socket.id);
        handlers.forEach((handler) => handler.register(socket));
    });

    return io;
};

module.exports = initialSocket;
