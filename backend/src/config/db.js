'use strict'

const mongoose = require('mongoose')

/**
 * connectDB – establishes a Mongoose connection to MongoDB Atlas.
 * Exits the process on failure so the server doesn't start in a broken state.
 */
const connectDB = async () => {
  try {
    // FIX: Fallback to Google DNS to prevent "querySrv ECONNREFUSED" on some networks (like mobile hotspots) only in dev
    // DNS override removed to prevent Railway production networking hangs

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000 // fail fast if db is unreachable
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
