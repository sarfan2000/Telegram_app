'use strict'

const mongoose = require('mongoose')

/**
 * User – core player document.
 *
 * Fields:
 *  telegram_id   – unique Telegram user ID (string to avoid JS BigInt issues)
 *  username      – Telegram @handle (optional)
 *  first_name    – from Telegram
 *  last_name     – from Telegram (optional)
 *  photo_url     – profile photo (optional, may expire)
 *  points        – total accumulated points
 *  daily         – sub-document tracking daily reward / ad state
 *  quizzesTaken  – count of completed quizzes
 *  adsWatched    – total lifetime ads watched
 *  createdAt     – auto via timestamps
 *  updatedAt     – auto via timestamps
 */
const dailySchema = new mongoose.Schema(
  {
    // Date of last daily reward claim (midnight UTC)
    lastDailyClaim: { type: Date, default: null },

    // Count of ads watched today
    adWatchesToday: { type: Number, default: 0 },

    // Date of last ad watch (to reset counter at midnight)
    lastAdWatchDate: { type: Date, default: null },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    telegram_id: {
      type: String,
      required: [true, 'telegram_id is required'],
      unique: true,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      default: null,
    },
    first_name: {
      type: String,
      trim: true,
      default: '',
    },
    last_name: {
      type: String,
      trim: true,
      default: '',
    },
    photo_url: {
      type: String,
      default: null,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    daily: {
      type: dailySchema,
      default: () => ({}),
    },
    quizzesTaken: {
      type: Number,
      default: 0,
    },
    adsWatched: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// ── Virtual: display name ──────────────────────────────────────────────────────
userSchema.virtual('displayName').get(function () {
  const full = [this.first_name, this.last_name].filter(Boolean).join(' ')
  return full || this.username || `User_${this.telegram_id}`
})

// ── Method: safe public profile (no internal Mongo fields) ────────────────────
userSchema.methods.toPublic = function () {
  return {
    telegram_id: this.telegram_id,
    username: this.username,
    first_name: this.first_name,
    last_name: this.last_name,
    photo_url: this.photo_url,
    points: this.points,
    quizzesTaken: this.quizzesTaken,
    adsWatched: this.adsWatched,
    quizzesToday: (this.daily && this.daily.quizzesToday) || 0,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model('User', userSchema)
