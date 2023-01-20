const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const rateLimit = require("express-rate-limit")

const bookRouter = require("./routers/bookRoutes")
const AppError = require("./utils/appError")

// Limit Requests From Same API
const rateLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Try again in an hour!"
})

const app = express()
if (process.env.NODE_ENV === "development") app.use(morgan("dev")) // Development Logging
app.use(express.json({limit: [10, "KB".toLowerCase()].join("")})) // Body JSON Parser

app.use(helmet()) // Set Security HTTP Headers
app.use(mongoSanitize()) // Data Sanitization Against NoSQL Query Injection
app.use(xss()) // Data Sanitization Against Cross-Site-Scripting
app.use("/api", rateLimiter) // Limit Request From Same API
app.use("/api/v1/books", bookRouter)

app.all("*", (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404))
})

module.exports = app
