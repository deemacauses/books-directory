const {promisify} = require("util")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")

const signToken = function signToken(id) {
  const tokenSecret = process.env.JWT_SECRET
  const tokenExpiresIn = process.env.JWT_EXPIRES_IN
  return jwt.sign({id}, tokenSecret, {
    expiresIn: tokenExpiresIn
  })
}

const createAndSendToken = function createAndSendToken(
  user,
  statusCode,
  response
) {
  const token = signToken(user._id)
  response.status(statusCode).json({status: "success", token, data: {user}})
}

exports.signup = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    role: request.body.role,
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt
  })

  createAndSendToken(newUser, 201, response)
})

exports.login = catchAsync(async (request, response, next) => {
  const {email, password} = request.body
  // 1) Check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400))
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({email}).select("+password")
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401))
  }

  // 3) If everything ok, send token to client
  createAndSendToken(user, 200, response)
})

exports.protect = catchAsync(async (request, response, next) => {
  // 1) Getting token and check if it's exists
  let token
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1]
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please login to get access.", 401)
    )
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError(
        "The token belonging to this token does no longer exist.",
        401
      )
    )
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    )
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  request.user = currentUser
  next()
})

exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      )
    }
    next()
  }
}
