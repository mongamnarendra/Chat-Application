const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const router = require("./Router/userRouter");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();

// middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// routes
app.use("/api/v1", router);

// create http server
const server = http.createServer(app);

// socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// ================= SOCKET LOGIC =================
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // join group room
  socket.on("join-group", ({ groupId }) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });

  // leave group room
  socket.on("leave-group", ({ groupId }) => {
    socket.leave(groupId);
    console.log(`Socket ${socket.id} left group ${groupId}`);
  });

  // send message to group
  socket.on("send-message", ({ groupId, message, sender }) => {
    console.log("Message received:", message);

    io.to(groupId).emit("receive-message", {
      groupId,
      message,
      sender,
      time: new Date()
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});
// =================================================

// start server
server.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
