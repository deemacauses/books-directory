const express = require("express")
const bookController = require("../controllers/bookController")
const authController = require("../controllers/authController")

const router = express.Router()
router
  .route("/")
  .get(authController.protect, bookController.getBooks)
  .post(
    authController.protect,
    authController.restrictTo("author"),
    bookController.createBook
  )

router
  .route("/:id")
  .get(bookController.getBook)
  .patch(
    authController.protect,
    authController.restrictTo("author"),
    bookController.updateBook
  )
  .delete(
    authController.protect,
    authController.restrictTo("author"),
    bookController.deleteBook
  )

module.exports = router
