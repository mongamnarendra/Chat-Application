const mongoose = require("mongoose");
const User = require("./User");


const GroupSchema = new mongoose.Schema({
    groupName:{
        type:String,
        required:true
    },

    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isGroup:{
        type: Boolean,
        default: false
    }
},{timestamps:true})

module.exports = mongoose.model("Group",GroupSchema);