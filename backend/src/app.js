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

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────────
// Normalize allowed origins (strip trailing slashes) and support
// matching vercel subdomains. Add logging to help debug blocked origins.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://telegram-app-seven-lake.vercel.app')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))

const corsOptions = {
  origin: (origin, callback) => {
    // Normalize incoming origin (may be undefined for non-browser clients)
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : origin

    const isAllowed =
      // Allow requests with no origin (mobile apps, Postman, Telegram WebView)
      !origin ||
      // Exact matches from ALLOWED_ORIGINS
      allowedOrigins.includes(normalizedOrigin) ||
      // Any vercel.app subdomain
      (typeof normalizedOrigin === 'string' && normalizedOrigin.endsWith('.vercel.app')) ||
      // Localhost (http/https)
      (typeof normalizedOrigin === 'string' && (normalizedOrigin.startsWith('http://localhost') || normalizedOrigin.startsWith('https://localhost')))

    if (isAllowed) {
      callback(null, true)
    } else {
      // Helpful log for diagnosing which origin was blocked in production
      // (Vercel / Railway logs will show this if the backend is deployed there)
      // eslint-disable-next-line no-console
      console.warn(`CORS blocked origin: ${origin} — allowed: ${allowedOrigins.join(',')}`)
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))


// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ── Request logging (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// ── Global rate limiter (100 req / 15 min per IP) ─────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api', globalLimiter)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes)
app.use('/api/rewards', rewardRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

// ── 404 & global error handler ────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)


module.exports = app