const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const router = require("./Router/userRouter");
const { Server } = require("socket.io");
const Message = require("./Model/Message");
const Conversation = require("./Model/ConversationSchema");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// inject io into req
app.use("/api/v1", (req, res, next) => {
  req.io = io;
  next();
}, router);

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join-group", ({ groupId }) => {
    socket.join(groupId);
  });

  socket.on("join-private", ({ conversationId }) => {
    socket.join(conversationId);
  });

  // GROUP MESSAGE
  socket.on("send-message", async ({ groupId, message, senderId, senderName }) => {
    const saved = await Message.create({
      groupId,
      senderId,
      senderName,
      message,
      type: "user",
      status: "sent",
    });

    io.to(groupId).emit("receive-message", saved);

    await Message.findByIdAndUpdate(saved._id, { status: "delivered" });
    io.to(groupId).emit("message-delivered", { messageId: saved._id });
  });

  // PRIVATE MESSAGE
  socket.on("send-private-message", async ({ conversationId, message, senderId }) => {
    const saved = await Message.create({
      conversationId,
      senderId,
      message,
      type: "user",
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: saved._id,
    });

    io.to(conversationId).emit("receive-private-message", saved);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on 3000");
});
