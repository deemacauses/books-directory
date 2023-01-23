const express = require("express")
const userController = require("../controllers/userController")
const authController = require("../controllers/authController")
const bookController = require("../controllers/bookController")

const router = express.Router()
router.post("/signup", authController.signup)
router.post("/login", authController.login)
router.route("/").post(userController.createUser)

module.exports = router
