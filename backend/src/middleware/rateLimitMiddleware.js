'use strict'

const rateLimit = require('express-rate-limit')

/**
 * Stricter limiter for auth endpoints.
 * 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes.',
  },
})

/**
 * Reward endpoint limiter – prevents rapid-fire reward spam.
 * 30 requests per 15 minutes per IP.
 */
const rewardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many reward requests. Please slow down.',
  },
})

module.exports = { authLimiter, rewardLimiter }
