const Group = require("../Model/Group");
const GroupMember = require("../Model/GroupMember");
const Message = require("../Model/Message");

const createGroup = async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        message: "Group name and userId are required",
      });
    }

    // Create group
    const group = await Group.create({
      groupName: name,
      createdBy: userId,
      isGroup: true,
    });

    // Add creator as admin
    await GroupMember.create({
      groupId: group._id,
      userId,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      groupId: group._id,
    });
  } catch (err) {
    console.error(err);
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

    return res.status(201).json({
      success: true,
      message: "User added to group",
      data: member,
    });
  } catch (err) {
    console.error(err);
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

    const member = await GroupMember.findOne({ groupId, userId });

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

    member.role = "admin";
    await member.save();

    return res.status(200).json({
      success: true,
      message: "User promoted to admin",
    });
  } catch (err) {
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

    const removed = await GroupMember.findOneAndDelete({
      groupId,
      userId,
    });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "User not found in group",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User removed from group",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};





module.exports = { createGroup, listOfGroupByUser, addMemberToGroup, listOfGroupMembers, makeAdmin, removeMember };
