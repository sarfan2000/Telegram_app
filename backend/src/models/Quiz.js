'use strict'

const mongoose = require('mongoose')

/**
 * Quiz – a bank of multiple-choice questions.
 *
 * Fields:
 *  question  – the question text
 *  options   – array of exactly 4 answer strings
 *  answer    – index (0-3) of the correct option
 *  category  – topic tag (general, science, tech, etc.)
 *  difficulty– easy | medium | hard
 *  active    – soft-delete flag; only active questions are served
 */
const quizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: 5,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: 'Exactly 4 options are required',
      },
      required: true,
    },
    answer: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: 0,
      max: 3,
    },
    category: {
      type: String,
      enum: ['general', 'science', 'technology', 'history', 'sports', 'entertainment'],
      default: 'general',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Index for fast active question retrieval
quizSchema.index({ active: 1, category: 1 })

module.exports = mongoose.model('Quiz', quizSchema)
