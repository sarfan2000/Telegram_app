'use strict'

const mongoose = require('mongoose')

/**
 * QuizResult – records each completed quiz attempt.
 *
 * Fields:
 *  user       – ref to User
 *  score      – number of correct answers
 *  total      – total questions in that session
 *  pointsEarned – points awarded for this attempt
 *  answers    – snapshot array of { questionId, selected, correct }
 *  duration   – how long the quiz took in seconds (optional)
 */
const answerSnapshotSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    selected: { type: Number },   // index chosen by player
    correct: { type: Number },    // index of correct answer
    isCorrect: { type: Boolean },
  },
  { _id: false }
)

const quizResultSchema = new mongoose.Schema(
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
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    answers: [answerSnapshotSchema],
    duration: {
      type: Number,   // seconds
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('QuizResult', quizResultSchema)
