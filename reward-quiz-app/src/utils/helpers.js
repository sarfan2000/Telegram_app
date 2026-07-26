/**
 * helpers.js – Shared utility functions.
 */

/**
 * Format a number with commas (e.g. 1234567 → "1,234,567").
 * @param {number} num
 * @returns {string}
 */
export const formatPoints = (num) =>
  new Intl.NumberFormat('en-US').format(num ?? 0)

/**
 * Return a greeting based on the current hour.
 * @returns {string}
 */
export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Truncate a string to maxLength and append ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 20) =>
  str && str.length > maxLength ? `${str.slice(0, maxLength)}…` : str ?? ''

/**
 * Build a display name from first_name + last_name, falling back to username.
 * @param {object} user
 * @returns {string}
 */
export const getDisplayName = (user) => {
  if (!user) return 'Guest'
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return full || user.username || 'Guest'
}

/**
 * Format an ISO date string to a readable short date.
 * @param {string} isoString
 * @returns {string}
 */
export const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Calculate percentage score.
 * @param {number} score
 * @param {number} total
 * @returns {number} 0–100
 */
export const calcPercent = (score, total) =>
  total > 0 ? Math.round((score / total) * 100) : 0

/**
 * Return medal emoji for leaderboard rank.
 * @param {number} rank - 1-indexed
 * @returns {string}
 */
export const rankMedal = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

/**
 * Sleep for ms milliseconds (useful for mock delays).
 * @param {number} ms
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
