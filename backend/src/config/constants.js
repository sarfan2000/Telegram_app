'use strict'

/**
 * constants.js – centralised app-wide configuration values.
 * Values are read from environment variables with safe defaults.
 */
module.exports = {
  // Points awarded for each correct quiz answer
  QUIZ_POINTS_PER_CORRECT: parseInt(process.env.QUIZ_POINTS_PER_CORRECT) || 10,

  // Points for watching one rewarded ad
  AD_REWARD_POINTS: parseInt(process.env.AD_REWARD_POINTS) || 10,

  // Points for daily login bonus
  DAILY_REWARD_POINTS: parseInt(process.env.DAILY_REWARD_POINTS) || 50,

  // Max ad watches allowed per user per calendar day
  MAX_DAILY_AD_WATCHES: parseInt(process.env.MAX_DAILY_AD_WATCHES) || 10,

  // Number of users shown on the leaderboard
  LEADERBOARD_LIMIT: 50,

  // JWT config
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
}
