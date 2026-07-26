'use strict'

const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { JWT_SECRET } = require('../config/constants')

// ── Telegram initData HMAC verification ──────────────────────────────────────

/**
 * verifyTelegramInitData
 * Validates the `X-Telegram-Init-Data` header using the bot token HMAC-SHA256
 * method described in the Telegram docs.
 *
 * Returns the parsed user object on success, or null on failure.
 *
 * @param {string} initData – raw URL-encoded initData string from Telegram
 * @returns {{ id, username, first_name, last_name, photo_url } | null}
 */
const verifyTelegramInitData = (initData) => {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return null

    // Build the data-check string: sorted key=value pairs (excluding hash)
    params.delete('hash')
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    // HMAC key = HMAC-SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN || '')
      .digest()

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (expectedHash !== hash) return null

    // Check that initData is not older than 24 hours
    const authDate = parseInt(params.get('auth_date'), 10)
    const age = Math.floor(Date.now() / 1000) - authDate
    if (age > 86400) return null // expired

    // Parse the user JSON object
    const userStr = params.get('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

// ── JWT helpers ──────────────────────────────────────────────────────────────

/**
 * Generate a signed JWT for a user document.
 * @param {object} user – Mongoose User document
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, telegram_id: user.telegram_id },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  )
}

// ── Middleware: protect routes ────────────────────────────────────────────────

/**
 * protect – Express middleware that accepts EITHER:
 *  1. A valid JWT in the Authorization header: `Bearer <token>`
 *  2. A valid Telegram initData in the `X-Telegram-Init-Data` header
 *
 * Sets req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    let user = null

    // ── Strategy 1: JWT ────────────────────────────────────────────────────
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      user = await User.findById(decoded.id).select('-__v')
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' })
      }
      req.user = user
      return next()
    }

    // ── Strategy 2: Telegram initData HMAC ────────────────────────────────
    const initData = req.headers['x-telegram-init-data']
    if (initData) {
      const telegramUser = verifyTelegramInitData(initData)
      if (!telegramUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Telegram initData.',
        })
      }

      user = await User.findOne({ telegram_id: String(telegramUser.id) })
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not registered. Call /api/users/login first.',
        })
      }
      req.user = user
      return next()
    }

    // ── Development bypass (only when NODE_ENV=development) ────────────────
    // Allows testing with Postman without a real Telegram token.
    if (process.env.NODE_ENV === 'development' && req.headers['x-dev-telegram-id']) {
      const devId = req.headers['x-dev-telegram-id']
      user = await User.findOne({ telegram_id: devId })
      if (user) {
        req.user = user
        return next()
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Provide a Bearer token or Telegram initData.',
    })
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' })
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' })
    }
    next(err)
  }
}

module.exports = { protect, generateToken, verifyTelegramInitData }
