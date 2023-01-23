const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A book must have a title"],
    trim: true,
    minlength: [5, "A book must have more or equal than 10 characters"],
    maxlength: [50, "A book must have less or equal than 50 characters"]
  },
  isbn: {
    type: String,
    required: [true, "A book must have an ISBN"],
    unique: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  pages: {
    type: Number,
    required: [true, "A book must have a pages number"]
  },
  publishedAt: {type: Date, default: Date.now()}
})

bookSchema.pre(/^find/, function callback(next) {
  this.populate({
    path: "author",
    select: "name"
  })
  next()
})

const Book = mongoose.model("Book", bookSchema)
module.exports = Book
