const Group = require("../Model/Group");
const GroupMember = require("../Model/GroupMember");
const Message = require("../Model/Message");

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name required",
      });
    }

    const group = await Group.create({
      groupName: name,
      createdBy: userId,
    });

    await GroupMember.create({
      groupId: group._id,
      userId,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      groupId: group._id,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const listOfGroupByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const groups = await GroupMember
      .find({ userId })
      .populate("groupId");

    // attach last message for each group
    const result = await Promise.all(
      groups.map(async (g) => {
        const lastMessage = await Message.findOne({
          groupId: g.groupId._id,
        })
          .sort({ createdAt: -1 })
          .select("message createdAt senderName");

        return {
          ...g.toObject(),
          lastMessage,
        };
      })
    );

    res.json({ list: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMemberToGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message: "groupId and userId are required",
      });
    }

    // check already member
    const existingMember = await GroupMember.findOne({
      groupId,
      userId,
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "User already in group",
      });
    }

    // add member
    const member = await GroupMember.create({
      groupId,
      userId,
      role: "member",
    });

    // populate user info for message
    const populatedMember = await member.populate(
      "userId",
      "name"
    );

    // ✅ SYSTEM MESSAGE
    const systemMessage = await Message.create({
      groupId,
      senderId: req.user.userId,
      senderName: "System",
      message: `${req.user.name} added ${populatedMember.userId.name} to the group`,
      type: "system",
      status: "seen",
    });

    // ✅ emit via socket
    req.io.to(groupId).emit("receive-message", systemMessage);

    return res.status(201).json({
      success: true,
      message: "User added to group",
      data: populatedMember,
    });
  } catch (err) {
    console.error("❌ addMemberToGroup error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const listOfGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) {
      return res.status(500).json({
        success: false,
        message: "Group Id is missing"
      })
    }

    const listOfMembers = await GroupMember.find({ groupId }).populate("userId", "name email");
    if (listOfMembers) {
      return res.status(200).json({
        success: true,
        message: "members fetched",
        data: listOfMembers
      })
    }
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Error"
    })
  }
}

const makeAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    const member = await GroupMember.findOne({ groupId, userId }).populate(
      "userId",
      "name"
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "User not found in group",
      });
    }

    if (member.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "User is already an admin",
      });
    }

    // promote to admin
    member.role = "admin";
    await member.save();

    // ✅ SYSTEM MESSAGE
    const systemMessage = await Message.create({
      groupId,
      senderId: req.user.userId,
      senderName: "System",
      message: `${req.user.name} made ${member.userId.name} an admin`,
      type: "system",
      status: "seen",
    });

    // emit to group
    req.io.to(groupId).emit("receive-message", systemMessage);

    return res.status(200).json({
      success: true,
      message: "User promoted to admin",
    });
  } catch (err) {
    console.error("❌ makeAdmin error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to make admin",
    });
  }
};


const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const loggedInUserId = req.user.userId;

    if (userId === loggedInUserId) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove himself",
      });
    }

    const removedMember = await GroupMember.findOneAndDelete({
      groupId,
      userId,
    }).populate("userId", "name");

    if (!removedMember) {
      return res.status(404).json({
        success: false,
        message: "User not found in group",
      });
    }

    // ✅ SYSTEM MESSAGE
    const systemMessage = await Message.create({
      groupId,
      senderId: req.user.userId,
      senderName: "System",
      message: `${req.user.name} removed ${removedMember.userId.name} from the group`,
      type: "system",
      status: "seen",
    });

    // emit to group
    req.io.to(groupId).emit("receive-message", systemMessage);

    return res.status(200).json({
      success: true,
      message: "User removed from group",
    });
  } catch (err) {
    console.error("❌ removeMember error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};






module.exports = { createGroup, listOfGroupByUser, addMemberToGroup, listOfGroupMembers, makeAdmin, removeMember };
