const mongoose = require("mongoose")
const dotenv = require("dotenv")

process.on("uncaughtException", (error) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...")
  console.log(error.name, error.message)
  process.exit(1)
})

dotenv.config({path: "./config.env"})
const app = require("./app")

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log("DB connection successful!"))

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})

process.on("unhandledRejection", (error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...")
  console.log(error.name, error.message)
  server.close(() => {
    process.exit(1)
  })
})
