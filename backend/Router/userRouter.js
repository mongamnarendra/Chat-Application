const { createGroup, listOfGroupByUser, addMemberToGroup } = require("../Controller/groupController");
const { getGroupMessages } = require("../Controller/messageController");
const userController = require("../Controller/userController");
const router = require("express").Router();


router.post("/auth/signup",userController.signUp)
router.post("/auth/login",userController.login)
router.get("/auth/getUser/:name",userController.getUserByName)

router.post('/chat/createGroup',createGroup);
router.post('/chat',listOfGroupByUser)

router.post('/group/add-member', addMemberToGroup)

router.get("/chat/messages/:groupId", getGroupMessages);


module.exports = router;