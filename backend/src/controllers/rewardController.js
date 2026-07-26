'use strict'

const User = require('../models/User')
const Reward = require('../models/Reward')
const { isToday, successResponse } = require('../utils/helpers')
const {
  AD_REWARD_POINTS,
  DAILY_REWARD_POINTS,
  MAX_DAILY_AD_WATCHES,
} = require('../config/constants')

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rewards/add  (protected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * addReward – award points for watching a Monetag rewarded ad.
 *
 * Enforces:
 *  - MAX_DAILY_AD_WATCHES per calendar day (UTC)
 *  - Points are exactly AD_REWARD_POINTS (server is the source of truth)
 *
 * Body: { source?: 'monetag_rewarded' }
 */
const addReward = async (req, res, next) => {
  try {
    const user = req.user

    // ── Daily ad watch limit check ────────────────────────────────────────
    const watchedToday = isToday(user.daily.lastAdWatchDate)
      ? user.daily.adWatchesToday
      : 0

    if (watchedToday >= MAX_DAILY_AD_WATCHES) {
      return res.status(429).json({
        success: false,
        message: `Daily ad limit of ${MAX_DAILY_AD_WATCHES} reached. Come back tomorrow!`,
        adWatchesToday: watchedToday,
        limit: MAX_DAILY_AD_WATCHES,
      })
    }

    // ── Award points ──────────────────────────────────────────────────────
    const newAdCount = watchedToday + 1
    const now = new Date()

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          points: AD_REWARD_POINTS,
          adsWatched: 1,
        },
        $set: {
          'daily.adWatchesToday': newAdCount,
          'daily.lastAdWatchDate': now,
        },
      },
      { new: true }
    )

    // ── Persist reward log ────────────────────────────────────────────────
    await Reward.create({
      user: user._id,
      telegram_id: user.telegram_id,
      points: AD_REWARD_POINTS,
      source: 'monetag_rewarded',
      meta: { adWatchNumber: newAdCount },
    })

    return res.json(
      successResponse(
        {
          pointsAdded: AD_REWARD_POINTS,
          totalPoints: updatedUser.points,
          adWatchesToday: newAdCount,
          remainingToday: MAX_DAILY_AD_WATCHES - newAdCount,
        },
        `+${AD_REWARD_POINTS} points added!`
      )
    )
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rewards/daily  (protected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * claimDailyReward – claim the daily login bonus (once per calendar day).
 */
const claimDailyReward = async (req, res, next) => {
  try {
    const user = req.user

    // ── Check if already claimed today ───────────────────────────────────
    if (isToday(user.daily.lastDailyClaim)) {
      return res.status(409).json({
        success: false,
        message: 'Daily reward already claimed. Come back tomorrow!',
        nextClaim: 'tomorrow',
      })
    }

    // ── Award daily bonus ─────────────────────────────────────────────────
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: { points: DAILY_REWARD_POINTS },
        $set: { 'daily.lastDailyClaim': new Date() },
      },
      { new: true }
    )

    // ── Persist reward log ────────────────────────────────────────────────
    await Reward.create({
      user: user._id,
      telegram_id: user.telegram_id,
      points: DAILY_REWARD_POINTS,
      source: 'daily',
    })

    return res.json(
      successResponse(
        {
          pointsAdded: DAILY_REWARD_POINTS,
          totalPoints: updatedUser.points,
        },
        `Daily bonus claimed! +${DAILY_REWARD_POINTS} points`
      )
    )
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/rewards/history  (protected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getRewardHistory – return paginated reward log for the current user.
 * Query params: page (default 1), limit (default 20)
 */
const getRewardHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit

    const [rewards, total] = await Promise.all([
      Reward.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('points source createdAt meta')
        .lean(),
      Reward.countDocuments({ user: req.user._id }),
    ])

    return res.json(
      successResponse(
        {
          rewards,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
        'Reward history fetched'
      )
    )
  } catch (err) {
    next(err)
  }
}

module.exports = { addReward, claimDailyReward, getRewardHistory }
