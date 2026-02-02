const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const router = require("./Router/userRouter");
const { Server } = require("socket.io");
const Message = require("./Model/Message");

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

  // // send message to group
  // socket.on("send-message", async ({ groupId, message, senderId, senderName }) => {
  //   try {
  //     const savedMessage = await Message.create({
  //       groupId,
  //       senderId,
  //       message,
  //     });

  //     io.to(groupId).emit("receive-message", {
  //       _id: savedMessage._id,
  //       groupId: savedMessage.groupId,
  //       senderId: savedMessage.senderId,
  //       message: savedMessage.message,
  //       createdAt: savedMessage.createdAt,
  //     });
  //   } catch (err) {
  //     console.log("Error", err)
  //   }

  // });

  socket.on("send-message", async ({ groupId, message, senderId, senderName }) => {
    try {
      const savedMessage = await Message.create({
        groupId,
        senderId,
        senderName,
        message,
        status: "sent",
      });

      // emit message
      io.to(groupId).emit("receive-message", savedMessage);

      // mark delivered immediately (users in room)
      await Message.findByIdAndUpdate(savedMessage._id, {
        status: "delivered",
      });

      io.to(groupId).emit("message-delivered", {
        messageId: savedMessage._id,
      });

    } catch (err) {
      console.error("❌ Message save failed:", err);
    }
  });


  socket.on("typing", async ({ groupId, userName }) => {
    socket.broadcast.to(groupId).emit("typing-feedback", {
      userName
    })
  })

  socket.on("mark-seen", async ({ groupId, userId }) => {
    try {
      // find messages that are eligible to be marked as seen
      const unseenMessages = await Message.find({
        groupId,
        senderId: { $ne: userId },   // receiver only
        seenBy: { $ne: userId }      // not already seen
      });

      // nothing to update → do nothing
      if (unseenMessages.length === 0) return;

      await Message.updateMany(
        {
          groupId,
          senderId: { $ne: userId },
          seenBy: { $ne: userId }
        },
        {
          $addToSet: { seenBy: userId },
          status: "seen"
        }
      );

      io.to(groupId).emit("messages-seen", {
        seenBy: userId
      });
    } catch (err) {
      console.error("❌ Seen update failed:", err);
    }
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
