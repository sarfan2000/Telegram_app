'use strict'

const mongoose = require('mongoose')

/**
 * Reward – audit log of every point-earning event.
 *
 * Having a separate collection lets you:
 *  - debug reward fraud
 *  - build analytics dashboards
 *  - replay / correct balances if needed
 *
 * source values:
 *  'daily'            – daily login bonus
 *  'monetag_rewarded' – watched a Monetag ad
 *  'quiz'             – completed a quiz
 *  'admin'            – manual admin grant
 */
const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    telegram_id: {
      type: String,
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      enum: ['daily', 'monetag_rewarded', 'quiz', 'admin'],
      required: true,
    },
    meta: {
      // Optional extra data (quiz score, ad provider, etc.)
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Reward', rewardSchema)
