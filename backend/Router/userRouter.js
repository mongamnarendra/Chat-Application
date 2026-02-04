const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {getUserByName} = require("../Controller/userController");
const { startPrivateChat, getPrivateMessages } = require("../Controller/conversationController");
const { getGroupMessages } = require("../Controller/messageController");
const { createGroup, listOfGroupByUser, addMemberToGroup, removeMember, makeAdmin, listOfGroupMembers } = require("../Controller/groupController");

// auth
router.post("/auth/signup", require("../Controller/userController").signUp);
router.post("/auth/login", require("../Controller/userController").login);
router.get("/auth/getUser/:name",getUserByName)

// groups
router.post("/chat/createGroup", createGroup);
router.post("/chat", listOfGroupByUser);
router.get("/chat/messages/:groupId", authMiddleware, getGroupMessages);

// group members
router.post("/group/add-member", authMiddleware, addMemberToGroup);
router.post("/group/remove-member", authMiddleware, removeMember);
router.post("/group/make-admin", authMiddleware, makeAdmin);
router.post("/group/group-members", authMiddleware, listOfGroupMembers);

// private chat
router.post("/chat/private/start", authMiddleware, startPrivateChat);
router.get("/chat/private/messages/:conversationId", authMiddleware, getPrivateMessages);

module.exports = router;
