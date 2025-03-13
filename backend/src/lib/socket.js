import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST","DELETE","PUT","PATCH"],
        credentials: true
    },
});

// Enhanced map for online users
const onlineUsers = new Map(); // userId -> socketId

// Function to get receiver socket ID
export const getReceiverSocketId = (userId) => {
    return onlineUsers.get(userId);
}

io.on("connection", (socket) => {
    // Get userId from the frontend query
    const userId = socket.handshake.query.userId;
    if (!userId) {
        console.log("Unauthorized connection");
        socket.disconnect();
        return;
    }

    console.log("User connected:", userId, socket.id);

    // Add user to the onlineUsers map
    onlineUsers.set(userId, socket.id);

    // Emit the list of online users to all connected clients
    io.emit("get-online-users", Array.from(onlineUsers.keys()));

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected", userId);

        // Remove the user from onlineUsers map
        onlineUsers.delete(userId);

        // Emit updated online users
        io.emit("get-online-users", Array.from(onlineUsers.keys()));
    });
});

export { io, app, server };