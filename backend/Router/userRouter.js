const userController = require("../Controller/userController");
const router = require("express").Router();


router.post("/signup",userController.signUp)
router.post("/login",userController.login)

module.exports = router;