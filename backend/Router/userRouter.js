const { createGroup, listOfGroupByUser, addMemberToGroup, listOfGroupMembers, removeMember, makeAdmin } = require("../Controller/groupController");
const { getGroupMessages } = require("../Controller/messageController");
const userController = require("../Controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const isGroupAdmin = require("../middleware/isGroupAdmin");
const router = require("express").Router();


router.post("/auth/signup",userController.signUp)
router.post("/auth/login",userController.login)
router.get("/auth/getUser/:name",userController.getUserByName)

router.post('/chat/createGroup',createGroup);
router.post('/chat',listOfGroupByUser)

router.post('/group/add-member',authMiddleware,isGroupAdmin, addMemberToGroup)
router.post('/group/make-admin',authMiddleware,isGroupAdmin, makeAdmin)
router.post("/group/remove-member",authMiddleware,isGroupAdmin,removeMember);

router.get("/chat/messages/:groupId", getGroupMessages);
router.post("/group/group-members",listOfGroupMembers)
module.exports = router;