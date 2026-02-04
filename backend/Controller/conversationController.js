const Conversation = require("../Model/ConversationSchema");
const Message = require("../Model/Message");

const startPrivateChat = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user.userId;

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, targetUserId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, targetUserId],
      });
    }

    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

const getPrivateMessages = async (req, res) => {
  const { conversationId } = req.params;
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  res.json({ success: true, messages });
};

module.exports = { startPrivateChat, getPrivateMessages };
