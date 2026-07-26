'use strict'

const { body } = require('express-validator')

/**
 * Validators for POST /api/users/login
 * telegram_id is required; all other fields are optional Telegram data.
 */
const loginValidators = [
  body('telegram_id')
    .notEmpty()
    .withMessage('telegram_id is required')
    .isString()
    .withMessage('telegram_id must be a string'),

  body('username')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 64 })
    .withMessage('username too long'),

  body('first_name')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 128 })
    .withMessage('first_name too long'),

  body('last_name')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 128 })
    .withMessage('last_name too long'),

  body('photo_url')
    .optional({ nullable: true })
    .isURL()
    .withMessage('photo_url must be a valid URL'),
]

module.exports = { loginValidators }
