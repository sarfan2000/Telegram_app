import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import UserCard from '../components/UserCard.jsx'
import PointsCard from '../components/PointsCard.jsx'
import { claimDailyReward } from '../services/api.js'
import { getGreeting } from '../utils/helpers.js'

/**
 * Home – landing page.
 *
 * Daily reward flow:
 *  - Calls backend POST /api/rewards/daily (protected via JWT)
 *  - On 200 → grant points, mark claimed
 *  - On 409 → already claimed today, mark claimed WITHOUT adding points
 *  - On other error → show error toast, do NOT grant points (prevents double-claim)
 */
function Home() {
  const { user, points, addPoints, syncFromServer } = useUser()
  const navigate = useNavigate()

  const [dailyClaimed, setDailyClaimed] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDailyReward = async () => {
    if (dailyClaimed || dailyLoading) return
    setDailyLoading(true)
    try {
      const res = await claimDailyReward()
      // Backend confirmed the claim — add points locally and sync balance
      addPoints(res?.pointsAdded ?? 50)
      setDailyClaimed(true)
      showToast(`🎉 Daily bonus! +${res?.pointsAdded ?? 50} points`)
    } catch (err) {
      if (err?.status === 409) {
        // Already claimed today — just reflect that in the UI, no points added
        setDailyClaimed(true)
        showToast('Daily bonus already claimed today.', 'info')
      } else if (err?.status === 401) {
        showToast('Login required. Restart the app.', 'error')
      } else {
        // Backend down / network error — DO NOT grant offline points
        // (prevents users from claiming multiple times during outages)
        showToast('Could not reach server. Try again later.', 'error')
      }
    } finally {
      setDailyLoading(false)
    }
  }

  // Real stats from the server-synced user object
  const quizzesTaken = user?.quizzesTaken ?? 0
  const adsWatched = user?.adsWatched ?? 0

  return (
    <div className="min-h-screen bg-tg-darker px-4 pt-8 pb-4 page-enter">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500/90 text-white'
              : toast.type === 'info'
              ? 'bg-tg-button/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-tg-hint text-sm">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-tg-text leading-tight">
            {user?.first_name || user?.username || 'Player'} 👋
          </h1>
        </div>
        <UserCard user={user} compact />
      </div>

      {/* ── Points card ── */}
      <PointsCard points={points} label="Your Balance" highlight />

      {/* ── Stats row (real data from user object) ── */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-tg-card rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl mb-1">🧠</p>
          <p className="text-tg-hint text-xs">Quizzes Played</p>
          <p className="text-tg-text font-bold text-lg">{quizzesTaken}</p>
        </div>
        <div className="bg-tg-card rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl mb-1">🎁</p>
          <p className="text-tg-hint text-xs">Ads Watched</p>
          <p className="text-tg-text font-bold text-lg">{adsWatched}</p>
        </div>
      </div>

      {/* ── Daily reward ── */}
      <div className="mt-6">
        <p className="text-tg-hint text-xs uppercase tracking-widest mb-2">
          Daily Bonus
        </p>
        <button
          onClick={handleDailyReward}
          disabled={dailyClaimed || dailyLoading}
          className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-all active:scale-95 ${
            dailyClaimed
              ? 'bg-green-500/20 border border-green-500/40 text-green-400 cursor-default'
              : dailyLoading
              ? 'bg-tg-card border border-white/10 text-tg-hint cursor-wait'
              : 'bg-tg-card border border-tg-blue/30 text-tg-blue hover:bg-tg-blue/10'
          }`}
        >
          <span className="text-2xl">
            {dailyLoading ? '⏳' : dailyClaimed ? '✅' : '🗓️'}
          </span>
          <div className="text-left">
            <div className="text-sm font-bold">
              {dailyLoading
                ? 'Claiming…'
                : dailyClaimed
                ? 'Bonus Claimed!'
                : 'Claim Daily Reward'}
            </div>
            <div className="text-xs opacity-70 font-normal">
              {dailyClaimed ? 'Come back tomorrow' : 'Get +50 free points'}
            </div>
          </div>
        </button>
      </div>

      {/* ── Action buttons ── */}
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-tg-hint text-xs uppercase tracking-widest">Play Now</p>

        <button
          onClick={() => navigate('/quiz')}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-tg-blue to-blue-600 text-white font-semibold active:scale-95 transition-all hover:shadow-lg hover:shadow-tg-blue/30"
        >
          <span className="text-2xl">🧠</span>
          <div className="text-left">
            <div>Start Quiz</div>
            <div className="text-xs opacity-80 font-normal">
              Answer questions, earn points
            </div>
          </div>
          <span className="ml-auto opacity-60">›</span>
        </button>

        <button
          onClick={() => navigate('/reward')}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-tg-card border border-white/5 text-tg-text font-semibold active:scale-95 transition-all hover:border-tg-blue/30"
        >
          <span className="text-2xl">🎁</span>
          <div className="text-left">
            <div>Watch & Earn</div>
            <div className="text-xs text-tg-hint font-normal">
              Watch an ad for +10 points
            </div>
          </div>
          <span className="ml-auto opacity-60">›</span>
        </button>
      </div>
    </div>
  )
}

export default Home
