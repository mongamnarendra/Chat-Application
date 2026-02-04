const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // Used for PRIVATE chat
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    default: null
  },

  // Used for GROUP chat
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  senderName: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },

  seenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  type: {
    type: String,
    enum: ["user", "system"],
    default: "user"
  }
}, { timestamps: true });

// Ensure message belongs to either group OR conversation
MessageSchema.pre("save", function () {
  if (!this.groupId && !this.conversationId) {
    throw new Error("Message must belong to a group or a conversation");
  }
});

module.exports = mongoose.model("Message", MessageSchema);
