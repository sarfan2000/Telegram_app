'use strict'

const express = require('express')
const router = express.Router()

const { getLeaderboard, getWeeklyLeaderboard } = require('../controllers/leaderboardController')
const { protect } = require('../middleware/authMiddleware')

// GET /api/leaderboard  – public, but attaches req.user if auth header present
// We use a soft-auth pattern: try to authenticate but don't block if it fails
const optionalAuth = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken')
    const User = require('../models/User')
    const { JWT_SECRET } = require('../config/constants')

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = await User.findById(decoded.id).lean()
    }
  } catch {
    // Auth failed – that's fine for a public route
  }
  next()
}

// GET /api/leaderboard  – all-time top users
router.get('/', optionalAuth, getLeaderboard)

// GET /api/leaderboard/weekly  – top users this week
router.get('/weekly', optionalAuth, getWeeklyLeaderboard)

module.exports = router
