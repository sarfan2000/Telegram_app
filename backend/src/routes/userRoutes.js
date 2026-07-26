'use strict'

const express = require('express')
const router = express.Router()

const { loginUser, getProfile, getMe } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const validate = require('../middleware/validateMiddleware')
const { authLimiter } = require('../middleware/rateLimitMiddleware')
const { loginValidators } = require('../validators/userValidators')

// POST /api/users/login  – upsert user + return JWT
// Stricter rate limit to prevent brute-force / spam
router.post('/login', authLimiter, loginValidators, validate, loginUser)

// GET /api/users/profile  – full profile with quiz history
router.get('/profile', protect, getProfile)

// GET /api/users/me  – lightweight current user
router.get('/me', protect, getMe)

module.exports = router
