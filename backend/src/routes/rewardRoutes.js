'use strict'

const express = require('express')
const router = express.Router()

const { addReward, claimDailyReward, getRewardHistory } = require('../controllers/rewardController')
const { protect } = require('../middleware/authMiddleware')
const { rewardLimiter } = require('../middleware/rateLimitMiddleware')

// All reward routes require authentication
router.use(protect)

// POST /api/rewards/add  – award ad-watch points
router.post('/add', rewardLimiter, addReward)

// POST /api/rewards/daily  – claim daily login bonus
router.post('/daily', claimDailyReward)

// GET /api/rewards/history  – paginated reward log
router.get('/history', getRewardHistory)

module.exports = router
