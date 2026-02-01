const Group = require("../Model/Group");
const GroupMember = require("../Model/GroupMember");

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
    const groupList = await GroupMember.find({ userId })
      .populate("groupId", "groupName createdBy")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      list: groupList
    })
  }
  catch (err) {
    console.log(err)
  }
}

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



module.exports = { createGroup, listOfGroupByUser, addMemberToGroup };
