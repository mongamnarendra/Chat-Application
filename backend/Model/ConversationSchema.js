const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    validate: {
      validator: function (v) {
        return v.length === 2;
      },
      message: "Private chat must have exactly 2 participants"
    },
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  },
  type: {
    type: String,
    enum: ["private"],
    default: "private"
  }
}, { timestamps: true });

// Prevent duplicate private conversations
ConversationSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", ConversationSchema);
