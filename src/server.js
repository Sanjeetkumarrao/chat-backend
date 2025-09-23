import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import msgRoutes from "./routes/messages.js";
import Message from "./models/Message.js";
import protectedRoutes from "./routes/protectedRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", msgRoutes);
app.use("/api/protected", protectedRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("user:online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online:update", Array.from(onlineUsers.keys()));
  });

  socket.on("join:chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send:message", async (payload) => {
    try {
      const message = await Message.create({
        chatId: payload.chatId,
        sender: payload.senderId,
        text: payload.text,
        attachments: payload.attachments || []
      });

      await message.populate("sender", "name avatarUrl");

      io.to(payload.chatId).emit("new:message", message);
    } catch (err) {
      console.error("Message save error:", err.message);
    }
  });

  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing", { chatId, userId });
  });

  socket.on("disconnect", () => {
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("online:update", Array.from(onlineUsers.keys()));
    console.log("❌ Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
