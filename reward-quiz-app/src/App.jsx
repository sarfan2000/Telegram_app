import React, { useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './context/UserContext.jsx'
import { loginUser, saveToken, getToken } from './services/api.js'
import useTelegram from './hooks/useTelegram.js'

// Pages
import Home from './pages/Home.jsx'
import Quiz from './pages/Quiz.jsx'
import Reward from './pages/Reward.jsx'
import Profile from './pages/Profile.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'

// Layout
import Navbar from './components/Navbar.jsx'
import Loading from './components/Loading.jsx'

function App() {
  const { telegramUser, isReady } = useTelegram()
  const { syncFromServer, setUser, setPoints, setLoading, loading } = useUser()

  // Prevent double-login on React StrictMode double-invoke
  const loginAttempted = useRef(false)

  useEffect(() => {
    if (!isReady || loginAttempted.current) return
    loginAttempted.current = true

    const autoLogin = async () => {
      setLoading(true)
      try {
        // Build the login payload from Telegram user data
        const payload = {
          telegram_id: String(telegramUser?.id ?? '123456789'),
          username: telegramUser?.username ?? null,
          first_name: telegramUser?.first_name ?? '',
          last_name: telegramUser?.last_name ?? '',
          photo_url: telegramUser?.photo_url ?? null,
        }

        // Store the telegram_id so the dev bypass header knows who to look up
        if (import.meta.env.DEV) {
          window.__DEV_TELEGRAM_ID__ = payload.telegram_id
        }

        const response = await loginUser(payload)

        // ── Backend returns: { success, token, user, message } ─────────────
        // Save JWT for all subsequent protected API calls
        if (response?.token) {
          saveToken(response.token)
        }

        // Hydrate context with server-confirmed user + points
        syncFromServer(response)
      } catch (err) {
        console.error('[App] Auto-login failed:', err.message)

        // ── Offline / backend-down fallback ───────────────────────────────
        // We still show the app using local Telegram data.
        // Points default to 0 until the next successful login.
        if (telegramUser) {
          setUser({
            telegram_id: String(telegramUser.id),
            username: telegramUser.username ?? null,
            first_name: telegramUser.first_name ?? '',
            last_name: telegramUser.last_name ?? '',
            photo_url: telegramUser.photo_url ?? null,
            points: 0,
            quizzesTaken: 0,
            adsWatched: 0,
          })
          setPoints(0)
        }
      } finally {
        setLoading(false)
      }
    }

    autoLogin()
  }, [isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading message="Starting app…" />

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <main className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Navbar />
    </div>
  )
}

export default App
