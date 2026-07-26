'use strict'

/**
 * helpers.js – shared utility functions used across controllers.
 */

/**
 * Returns true if the given date is today (UTC calendar day).
 * @param {Date|null} date
 * @returns {boolean}
 */
const isToday = (date) => {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  )
}

/**
 * Returns a standard success response object.
 * @param {object} data
 * @param {string} [message]
 */
const successResponse = (data = {}, message = 'Success') => ({
  success: true,
  message,
  ...data,
})

/**
 * Returns a standard error response object.
 * @param {string} message
 * @param {number} [statusCode]
 */
const errorResponse = (message = 'Error', statusCode = 400) => {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

/**
 * Shuffle an array in place (Fisher-Yates algorithm).
 * Used to randomise question order.
 * @param {Array} array
 * @returns {Array} the same array, shuffled
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Pick n random elements from an array without replacement.
 * @param {Array} array
 * @param {number} n
 * @returns {Array}
 */
const pickRandom = (array, n) => shuffleArray([...array]).slice(0, n)

module.exports = { isToday, successResponse, errorResponse, shuffleArray, pickRandom }
