import axios from 'axios'

// ── Token helpers (JWT persisted in localStorage) ────────────────────────────

export const getToken = () => localStorage.getItem('rq_token')
export const saveToken = (token) => localStorage.setItem('rq_token', token)
export const clearToken = () => localStorage.removeItem('rq_token')

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor ───────────────────────────────────────────────────────
// Priority order:
//  1. JWT Bearer token (most reliable — valid for 30 days)
//  2. Telegram initData (valid 24 h, used as fallback / first call)
//  3. Dev bypass header (only in development, never in production)
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // Always attach initData as well — the backend falls through to it
  // when no JWT is present (first login call)
  const initData = window?.Telegram?.WebApp?.initData
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData
  }

  // Development bypass: lets the backend find the user without a real token
  if (import.meta.env.DEV && !token && !initData) {
    const devId = window.__DEV_TELEGRAM_ID__ || '123456789'
    config.headers['X-Dev-Telegram-Id'] = String(devId)
  }

  return config
})

// ── Response interceptor ──────────────────────────────────────────────────────
// The backend wraps every response as:
//   { success: true, message: '...', ...data }
// OR (for some endpoints):
//   { success: true, message: '...', data: { ... } }   ← legacy shape
//
// We normalise: always return the inner payload so callers don't
// have to deal with the wrapper.
api.interceptors.response.use(
  (response) => {
    // response.data is already the parsed JSON body
    const body = response.data
    // If the backend nested the payload under a `data` key, unwrap it.
    // Otherwise return the body as-is.
    return body
  },
  (error) => {
    const message =
      error?.response?.data?.message || error.message || 'Network error'
    // Attach the HTTP status so callers can react (e.g. 409 = already claimed)
    const err = new Error(message)
    err.status = error?.response?.status
    err.data = error?.response?.data
    return Promise.reject(err)
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * loginUser – POST /api/users/login
 * Upserts the Telegram user in MongoDB, returns { token, user }.
 * The caller is responsible for saving the token via saveToken().
 *
 * @param {{ telegram_id, username?, first_name?, last_name?, photo_url? }} payload
 * @returns {Promise<{ success, token, user, message }>}
 */
export const loginUser = (payload) => api.post('/api/users/login', payload)

// ─────────────────────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getUserProfile – GET /api/users/profile  (protected)
 * Returns the authenticated user's profile + quiz history + reward summary.
 * The telegram_id param is not used by the backend (it uses req.user),
 * but kept for clarity / future use.
 *
 * @returns {Promise<{ success, user, quizHistory, rewardSummary, message }>}
 */
export const getUserProfile = () => api.get('/api/users/profile')

/**
 * getMe – GET /api/users/me  (protected)
 * Lightweight fetch of current user object.
 *
 * @returns {Promise<{ success, user, message }>}
 */
export const getMe = () => api.get('/api/users/me')

// ─────────────────────────────────────────────────────────────────────────────
// Rewards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * addReward – POST /api/rewards/add  (protected)
 * Awards ad-watch points. Backend enforces the daily limit server-side.
 * The `points` and `source` fields in the body are informational only;
 * the backend always uses its own constants.
 *
 * @returns {Promise<{ success, pointsAdded, totalPoints, adWatchesToday, remainingToday, message }>}
 */
export const addReward = () => api.post('/api/rewards/add', {})

/**
 * claimDailyReward – POST /api/rewards/daily  (protected)
 * Claims the once-per-day login bonus.
 * Returns 409 if already claimed today.
 *
 * @returns {Promise<{ success, pointsAdded, totalPoints, message }>}
 */
export const claimDailyReward = () => api.post('/api/rewards/daily', {})

/**
 * getRewardHistory – GET /api/rewards/history  (protected)
 * Paginated reward log.
 */
export const getRewardHistory = (page = 1, limit = 20) =>
  api.get('/api/rewards/history', { params: { page, limit } })

// ─────────────────────────────────────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getQuizQuestions – GET /api/quiz/questions  (protected)
 * Returns randomised questions WITHOUT the answer field (graded server-side).
 *
 * @param {number} [count=10]
 * @returns {Promise<{ success, questions, total, message }>}
 */
export const getQuizQuestions = (count = 10) =>
  api.get('/api/quiz/questions', { params: { count } })

/**
 * submitQuizAnswers – POST /api/quiz/submit  (protected)
 * Sends answer array for server-side grading. Returns score + points earned.
 *
 * @param {Array<{ questionId: string, selected: number }>} answers
 * @returns {Promise<{ success, score, total, percentage, pointsEarned, answers, message }>}
 */
export const submitQuizAnswers = (answers) =>
  api.post('/api/quiz/submit', { answers })

/**
 * getQuizHistory – GET /api/quiz/history  (protected)
 * Paginated past quiz results.
 */
export const getQuizHistory = (page = 1) =>
  api.get('/api/quiz/history', { params: { page } })

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getLeaderboard – GET /api/leaderboard  (public, optional auth)
 * Returns top users sorted by points. Includes `myRank` if authenticated.
 *
 * @returns {Promise<{ success, users, total, myRank, message }>}
 */
export const getLeaderboard = () => api.get('/api/leaderboard')

/**
 * getWeeklyLeaderboard – GET /api/leaderboard/weekly  (public)
 */
export const getWeeklyLeaderboard = () => api.get('/api/leaderboard/weekly')

export default api
