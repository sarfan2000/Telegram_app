'use strict'

const { body } = require('express-validator')

/**
 * Validators for POST /api/quiz/submit
 */
const submitValidators = [
  body('answers')
    .isArray({ min: 1, max: 20 })
    .withMessage('answers must be an array of 1–20 items'),

  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Each answer must include a questionId')
    .isMongoId()
    .withMessage('questionId must be a valid MongoDB ObjectId'),

  body('answers.*.selected')
    .isInt({ min: 0, max: 3 })
    .withMessage('selected must be an integer 0–3'),
]

module.exports = { submitValidators }
