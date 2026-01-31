const mongoose = require("mongoose");

const GroupMemberSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
    }
},{timestamps:true})

GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("GroupMember",GroupMemberSchema)

