'use strict'

/**
 * notFound – catch-all for unmatched routes, turns them into a 404 error.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}

/**
 * errorHandler – global Express error handler.
 * Formats all errors into a consistent JSON shape:
 *   { success: false, message: string, errors?: array, stack?: string }
 */
const errorHandler = (err, req, res, _next) => {
  // Default to 500 if no status was set
  const statusCode = err.statusCode || err.status || 500

  // Mongoose duplicate key error (e.g. duplicate telegram_id)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({
      success: false,
      message: `Duplicate value for '${field}'.`,
    })
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: messages,
    })
  }

  // Mongoose cast error (e.g. bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}'.`,
    })
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only expose stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

module.exports = { notFound, errorHandler }
