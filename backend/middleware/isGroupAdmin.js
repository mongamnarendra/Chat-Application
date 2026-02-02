const GroupMember = require("../Model/GroupMember");

const isGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.userId; // from JWT middleware

    const member = await GroupMember.findOne({
      groupId,
      userId,
    });

    if (!member || member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can perform this action",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Admin check failed",
    });
  }
};

module.exports = isGroupAdmin;
