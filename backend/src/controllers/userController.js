'use strict'

const User = require('../models/User')
const QuizResult = require('../models/QuizResult')
const Reward = require('../models/Reward')
const { generateToken } = require('../middleware/authMiddleware')
const { successResponse, errorResponse } = require('../utils/helpers')

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/login
// ─────────────────────────────────────────────────────────────────────────────

/**
 * loginUser – upsert a user from Telegram data and return a JWT.
 *
 * Body: { telegram_id, username?, first_name?, last_name?, photo_url? }
 *
 * This is the entry point for every Mini App session. We either create the
 * user (first visit) or update their profile (Telegram data may change over time).
 */
const loginUser = async (req, res, next) => {
  try {
    const { telegram_id, username, first_name, last_name, photo_url } = req.body

    // Upsert: update profile fields on every login so they stay fresh
    const user = await User.findOneAndUpdate(
      { telegram_id: String(telegram_id) },
      {
        $set: {
          username: username || null,
          first_name: first_name || '',
          last_name: last_name || '',
          photo_url: photo_url || null,
        },
        // Only set points/daily on first insert ($setOnInsert)
        $setOnInsert: {
          points: 0,
          quizzesTaken: 0,
          adsWatched: 0,
          daily: {},
        },
      },
      {
        new: true,        // return the updated document
        upsert: true,     // create if not found
        runValidators: true,
      }
    )

    const token = generateToken(user)

    return res.status(200).json(
      successResponse(
        { token, user: user.toPublic() },
        'Login successful'
      )
    )
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/profile  (protected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getProfile – return the authenticated user's full profile plus their
 * last 20 quiz results and lifetime reward summary.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = req.user // set by authMiddleware

    // Last 20 quiz results, newest first
    const quizHistory = await QuizResult.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('score total pointsEarned createdAt')
      .lean()

    // Aggregate total rewards by source
    const rewardSummary = await Reward.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$source', total: { $sum: '$points' } } },
    ])

    return res.json(
      successResponse(
        {
          user: user.toPublic(),
          quizHistory,
          rewardSummary,
        },
        'Profile fetched'
      )
    )
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/me  (protected) – lightweight version for navbar display
// ─────────────────────────────────────────────────────────────────────────────

const getMe = async (req, res, next) => {
  try {
    return res.json(successResponse({ user: req.user.toPublic() }, 'OK'))
  } catch (err) {
    next(err)
  }
}

module.exports = { loginUser, getProfile, getMe }
