'use strict'

const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

// Connect to MongoDB then start listening
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  })
}).catch(err => {
  console.error("Failed to connect to database on startup:", err)
  process.exit(1)
})
