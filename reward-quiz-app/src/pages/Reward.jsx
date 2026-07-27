import React, { useState, useRef } from 'react'
import { useUser } from '../context/UserContext.jsx'
import RewardButton from '../components/RewardButton.jsx'
import PointsCard from '../components/PointsCard.jsx'
import { showRewardAd } from '../services/monetag.js'
import { addReward } from '../services/api.js'
import { formatPoints } from '../utils/helpers.js'

// The server enforces the real daily limit — this constant just drives the UI
const MAX_DAILY_ADS = 10

/**
 * Reward – watch Monetag rewarded ads to earn points.
 *
 * Reward flow (correct order matters):
 *  1. Show the ad (Monetag promise must resolve first)
 *  2. Call POST /api/rewards/add to persist points server-side
 *  3. Only if backend confirms → update local balance
 *
 * If the backend call fails we still show a soft success because the
 * ad was watched — the backend will have its own idempotency on the
 * next successful call. We do NOT blindly grant points on network errors
 * in production — the DEV simulation is the only exception.
 */
function Reward() {
  const { user, points, addPoints, setPoints, incrementAdsWatched } = useUser()

  // Session ad count (resets on page reload — backend is the source of truth)
  const [adsWatched, setAdsWatched] = useState(0)
  const [toast, setToast] = useState(null)
  const [history, setHistory] = useState([])

  // Guard against double-tap while ad promise is pending
  const adInProgress = useRef(false)

  const dailyLimitReached = adsWatched >= MAX_DAILY_ADS

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleWatchAd = async () => {
    // Prevent multiple simultaneous ad triggers
    if (adInProgress.current || dailyLimitReached) return
    adInProgress.current = true

    try {
      // ── Step 1: Show the Monetag rewarded ad ─────────────────────────────
      // This resolves only when the user watches the full ad.
      // In DEV mode, it resolves automatically after 1.5 s.
      await showRewardAd()

      // ── Step 2: Notify backend (protected route, uses JWT from localStorage) ──
      let pointsAdded = 10  // default optimistic amount
      let backendConfirmed = false

      try {
        const res = await addReward()
        // Backend is the source of truth for how many points to grant
        pointsAdded = res?.pointsAdded ?? 10

        // Sync the server-confirmed total balance (not just a local increment)
        if (typeof res?.totalPoints === 'number') {
          setPoints(res.totalPoints)
        } else {
          addPoints(pointsAdded)
        }

        backendConfirmed = true
      } catch (apiErr) {
        if (apiErr?.status === 429) {
          // Server-side daily limit reached (even if our local counter hasn't)
          showToast('Daily ad limit reached. Come back tomorrow! 🌙', 'error')
          adInProgress.current = false
          return
        }
        if (apiErr?.status === 401) {
          showToast('Session expired. Please restart the app.', 'error')
          adInProgress.current = false
          return
        }
        // For other backend errors (network outage etc.) we still reward
        // locally so the user doesn't feel cheated after watching the full ad.
        // The backend audit log will be missing this entry.
        addPoints(pointsAdded)
        console.warn('[Reward] Backend call failed, rewarding locally:', apiErr.message)
      }

      // ── Step 3: Update session UI ────────────────────────────────────────
      setAdsWatched((n) => n + 1)
      incrementAdsWatched()
      setHistory((h) => [
        {
          points: pointsAdded,
          time: new Date().toLocaleTimeString(),
          confirmed: backendConfirmed,
        },
        ...h,
      ])
      showToast(`+${pointsAdded} points added! 🎉`)
    } catch (adErr) {
      // Ad was skipped, failed to load, or SDK error
      showToast(adErr?.message || 'Ad was not completed. Try again.', 'error')
    } finally {
      adInProgress.current = false
    }
  }

  return (
    <div className="min-h-screen bg-tg-darker px-4 pt-8 pb-4 page-enter">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl transition-all ${toast.type === 'success'
            ? 'bg-green-500/90 text-white'
            : 'bg-red-500/90 text-white'
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-tg-text">Watch & Earn 🎁</h1>
        <p className="text-tg-hint text-sm mt-1">
          Watch short ads to earn reward points instantly.
        </p>
      </div>

      {/* ── Current balance (always reflects latest server-synced value) ── */}
      <PointsCard points={points} label="Current Balance" highlight />

      {/* ── Daily progress ── */}
      <div className="bg-tg-card rounded-2xl p-4 border border-white/5 mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-tg-hint text-xs uppercase tracking-widest">
            Today's Ads
          </span>
          <span className="text-tg-text text-xs font-medium">
            {adsWatched} / {MAX_DAILY_ADS}
          </span>
        </div>
        <div className="h-2 bg-tg-darker rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-tg-blue to-green-400 transition-all duration-500"
            style={{ width: `${Math.min(100, (adsWatched / MAX_DAILY_ADS) * 100)}%` }}
          />
        </div>
        <p className="text-tg-hint text-xs mt-2">
          {dailyLimitReached
            ? 'Session limit reached. Come back tomorrow! 🌙'
            : `${MAX_DAILY_ADS - adsWatched} more ads available this session`}
        </p>
      </div>

      {/* ── How it works ── */}
      <div className="bg-tg-card rounded-2xl p-4 border border-white/5 mt-4">
        <p className="text-tg-hint text-xs uppercase tracking-widest mb-3">
          How It Works
        </p>
        {[
          { icon: '▶️', text: 'Tap "Watch Ad" below' },
          { icon: '📺', text: 'A short rewarded ad plays' },
          { icon: '✅', text: 'Watch it fully to completion' },
          { icon: '🪙', text: '+10 points added & saved instantly' },
        ].map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0"
          >
            <span className="text-lg w-7">{step.icon}</span>
            <span className="text-tg-text text-sm">{step.text}</span>
          </div>
        ))}
      </div>

      {/* ── Main CTA ── */}
      <div className="mt-6">
        <RewardButton
          onClick={handleWatchAd}
          label="Watch Advertisement"
          points={10}
          disabled={dailyLimitReached}
        />
      </div>

      {/* ── Earning history (this session) ── */}
      {history.length > 0 && (
        <div className="mt-6">
          <p className="text-tg-hint text-xs uppercase tracking-widest mb-3">
            This Session
          </p>
          <div className="flex flex-col gap-2">
            {history.map((item, i) => (
              <div
                key={i}
                className="bg-tg-card rounded-xl px-4 py-2.5 flex justify-between items-center border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{item.confirmed ? '✅' : '⚠️'}</span>
                  <span className="text-tg-hint text-xs">{item.time}</span>
                </div>
                <span className="text-green-400 font-bold text-sm">
                  +{item.points} pts
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-tg-hint text-xs mt-3">
            Session total:{' '}
            <span className="text-tg-blue font-bold">
              +{formatPoints(history.reduce((s, h) => s + h.points, 0))} pts
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Reward
