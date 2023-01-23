const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "author"],
    default: "user"
  },
  name: {
    type: String,
    required: [true, "Please tell us your name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    trim: true,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    trim: true,
    validate: {
      // This only work on .create() .save()
      validator(element) {
        return element === this.password
      },
      message: "Passwords are not the same!"
    }
  },
  passwordChangedAt: Date,
  books: [{type: mongoose.Schema.ObjectId, ref: "Book"}]
})

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next()
  // Hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12)
  // Delete passwordConfirm field
  this.passwordConfirm = undefined
  next()
})

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // CandidatePassword: the password that comes from the user
  // usePassword: the hashed password
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }

  // False means NOT changed
  return false
}

const User = mongoose.model("User", userSchema)
module.exports = User
