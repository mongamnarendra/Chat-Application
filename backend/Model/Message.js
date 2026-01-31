const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true
    }
},{timestamps:true})

messageSchema.index({ groupId: 1, createdAt: 1 });

module.exports = mongoose.model("Message")