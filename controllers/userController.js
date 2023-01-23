const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")

exports.getAllUsers = catchAsync(async (request, response) => {
  const users = await User.find()
  response
    .status(200)
    .json({status: "success", results: users.length, data: {users}})
})

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not defined! use /signup instead"
  })
}
