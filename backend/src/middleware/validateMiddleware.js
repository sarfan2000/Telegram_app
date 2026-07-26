'use strict'

const { validationResult } = require('express-validator')

/**
 * validate – middleware that reads express-validator results and short-circuits
 * the request with a 422 if any validation rule failed.
 *
 * Usage: place after your validation chain in a route:
 *   router.post('/login', [...validators], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

module.exports = validate
