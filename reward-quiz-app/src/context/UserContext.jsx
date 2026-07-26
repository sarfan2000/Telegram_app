import React, { createContext, useContext, useState, useCallback } from 'react'

/**
 * UserContext – global state for authenticated Telegram user,
 * their points, profile, and quiz history.
 *
 * Design rules:
 *  - `points` is always the server-confirmed value + locally optimistic additions
 *  - `quizHistory` is hydrated from the backend on Profile mount (not just session)
 *  - `token` is stored in localStorage by api.js — context just signals readiness
 */
const UserContext = createContext(null)

export function UserProvider({ children }) {
  // Full user profile object (shape from User.toPublic())
  const [user, setUser] = useState(null)

  // Current point balance — synced from server on login & profile fetch
  const [points, setPoints] = useState(0)

  // Array of past quiz results: { score, total, pointsEarned, createdAt }
  const [quizHistory, setQuizHistory] = useState([])

  // Global loading flag (true during auto-login)
  const [loading, setLoading] = useState(true)

  /**
   * Optimistically add points to the local balance.
   * The true balance is always confirmed server-side; this just
   * keeps the UI feeling snappy between API calls.
   * @param {number} amount
   */
  const addPoints = useCallback((amount) => {
    setPoints((prev) => prev + amount)
  }, [])

  /**
   * Sync all user data from a backend profile/login response.
   * Handles both the login response shape and the profile response shape.
   *
   * Login response:   { token, user: { ...toPublic() } }
   * Profile response: { user: { ...toPublic() }, quizHistory, rewardSummary }
   *
   * @param {object} payload - the response body from the API
   */
  const syncFromServer = useCallback((payload) => {
    // Normalise: token lives alongside user at the top level from login
    const serverUser = payload?.user
    if (serverUser) {
      setUser(serverUser)
      // Always trust the server's point count — add any pending optimistic delta
      setPoints(serverUser.points ?? 0)
    }

    // Hydrate quiz history when available (from /profile endpoint)
    if (Array.isArray(payload?.quizHistory)) {
      setQuizHistory(payload.quizHistory)
    }
  }, [])

  /**
   * Prepend a locally-completed quiz result to history.
   * This gives instant feedback before the next profile refresh.
   * @param {{ score, total, pointsEarned, createdAt }} result
   */
  const addQuizResult = useCallback((result) => {
    setQuizHistory((prev) => [result, ...prev])
  }, [])

  /**
   * Clear all user state (e.g. on logout or auth failure).
   */
  const clearUser = useCallback(() => {
    setUser(null)
    setPoints(0)
    setQuizHistory([])
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        points,
        setPoints,
        addPoints,
        syncFromServer,
        quizHistory,
        setQuizHistory,
        addQuizResult,
        loading,
        setLoading,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

/**
 * useUser – convenience hook. Throws if used outside <UserProvider>.
 */
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a <UserProvider>')
  return ctx
}

export default UserContext
