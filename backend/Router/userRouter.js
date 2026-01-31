const { createGroup, listOfGroupByUser } = require("../Controller/groupController");
const userController = require("../Controller/userController");
const router = require("express").Router();


router.post("/auth/signup",userController.signUp)
router.post("/auth/login",userController.login)
router.get("/auth/getUser/:name",userController.getUserByName)

router.post('/chat/createGroup',createGroup);
router.post('/chat',listOfGroupByUser)

module.exports = router;