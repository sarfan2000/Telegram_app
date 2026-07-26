'use strict'

const User = require('../models/User')
const { LEADERBOARD_LIMIT } = require('../config/constants')
const { successResponse } = require('../utils/helpers')

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leaderboard  (public – no auth required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getLeaderboard – return the top N users sorted by points (descending).
 *
 * Query params:
 *  - limit : max results (default 50, capped at 100)
 *
 * Also returns the requesting user's position if they send their telegram_id
 * via the X-Telegram-Init-Data header (auth is optional here).
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit) || LEADERBOARD_LIMIT)

    const users = await User.find({})
      .sort({ points: -1 })
      .limit(limit)
      .select('telegram_id username first_name last_name photo_url points quizzesTaken')
      .lean()

    // Add rank field
    const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }))

    // If the user is authenticated, find their rank even if outside top N
    let myRank = null
    if (req.user) {
      const above = await User.countDocuments({ points: { $gt: req.user.points } })
      myRank = above + 1
    }

    return res.json(
      successResponse(
        { users: ranked, total: ranked.length, myRank },
        'Leaderboard fetched'
      )
    )
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leaderboard/weekly  (public)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getWeeklyLeaderboard – rank by total quiz points earned this week.
 * Uses aggregation on the Reward collection for the last 7 days.
 */
const getWeeklyLeaderboard = async (req, res, next) => {
  try {
    const Reward = require('../models/Reward')
    const limit = Math.min(100, parseInt(req.query.limit) || 50)

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const weekly = await Reward.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$telegram_id', weeklyPoints: { $sum: '$points' } } },
      { $sort: { weeklyPoints: -1 } },
      { $limit: limit },
    ])

    // Enrich with user profile data
    const telegramIds = weekly.map((w) => w._id)
    const users = await User.find({ telegram_id: { $in: telegramIds } })
      .select('telegram_id username first_name last_name photo_url points')
      .lean()

    const userMap = {}
    users.forEach((u) => { userMap[u.telegram_id] = u })

    const result = weekly.map((w, i) => ({
      rank: i + 1,
      weeklyPoints: w.weeklyPoints,
      ...(userMap[w._id] || { telegram_id: w._id }),
    }))

    return res.json(successResponse({ users: result }, 'Weekly leaderboard fetched'))
  } catch (err) {
    next(err)
  }
}

module.exports = { getLeaderboard, getWeeklyLeaderboard }
