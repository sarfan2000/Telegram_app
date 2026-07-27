'use strict'

require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const userRoutes = require('./routes/userRoutes')
const rewardRoutes = require('./routes/rewardRoutes')
const quizRoutes = require('./routes/quizRoutes')
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()


// ─────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)


// ─────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,https://telegram-app-seven-lake.vercel.app'
)
.split(',')
.map(origin => origin.trim())
.filter(Boolean)


const corsOptions = {

  origin: (origin, callback) => {

    // Allow Postman, mobile apps, Telegram WebView
    if (!origin) {
      return callback(null, true)
    }


    // Allowed frontend domains
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost')
    ) {
      return callback(null, true)
    }


    console.log("Blocked CORS Origin:", origin)

    return callback(
      new Error(`CORS blocked: ${origin}`)
    )

  },


  credentials: true,


  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],


  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],


  optionsSuccessStatus: 200

}


// Apply CORS
app.use(cors(corsOptions))


// Handle preflight requests
app.options('*', cors(corsOptions))



// ─────────────────────────────────────────
// Body Parser
// ─────────────────────────────────────────

app.use(
  express.json({
    limit: '10kb'
  })
)


app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb'
  })
)



// ─────────────────────────────────────────
// Logger
// ─────────────────────────────────────────

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}



// ─────────────────────────────────────────
// Rate Limiter
// ─────────────────────────────────────────

const globalLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }

})


app.use('/api', globalLimiter)



// ─────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────

app.get('/health', (req, res) => {

  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Telegram API running',
    time: new Date()
  })

})



// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────

app.use('/api/users', userRoutes)

app.use('/api/rewards', rewardRoutes)

app.use('/api/quiz', quizRoutes)

app.use('/api/leaderboard', leaderboardRoutes)



// ─────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────

app.use(notFound)

app.use(errorHandler)



module.exports = app