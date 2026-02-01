const Message = require("../Model/Message");

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 }); // oldest → newest

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

module.exports = { getGroupMessages };
