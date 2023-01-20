const Book = require("../models/bookModel")
const AppError = require("../utils/appError")
const catchAsyncFunction = require("../utils/catchAsync")

exports.getBooks = catchAsyncFunction(async (request, response, next) => {
  const books = await Book.find()

  response.status(200).json({
    status: "success",
    results: books.length,
    data: {books}
  })
})

exports.getBook = catchAsyncFunction(async (request, response, next) => {
  const {id} = request.params
  const book = await Book.findById(id)
  if (!book) return next(new AppError("There is no book with this ID", 404))

  response.status(200).json({status: "success", data: {book}})
})

exports.createBook = catchAsyncFunction(async (request, response, next) => {
  const book = await Book.create(request.body)

  response.status(201).json({status: "success", data: {book}})
})

exports.updateBook = catchAsyncFunction(async (request, response, next) => {
  const {id} = request.params
  const book = await Book.findByIdAndUpdate(id, request.body, {
    new: true,
    runValidators: true
  })
  if (!book) return next(new AppError("There is no book with this ID", 404))

  response.status(200).json({status: "success", data: {book}})
})

exports.deleteBook = catchAsyncFunction(async (request, response, next) => {
  const {id} = request.params
  const book = await Book.findByIdAndDelete(id)
  if (!book) return next(new AppError("There is no book with this ID", 404))

  response.status(204).json({
    status: "success",
    data: null
  })
})
