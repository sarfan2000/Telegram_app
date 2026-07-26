import React, { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext.jsx'
import { getUserProfile } from '../services/api.js'
import UserCard from '../components/UserCard.jsx'
import PointsCard from '../components/PointsCard.jsx'
import Loading from '../components/Loading.jsx'
import { formatPoints, formatDate, calcPercent, getDisplayName } from '../utils/helpers.js'

/**
 * Profile – shows full user profile, server-synced points, and quiz history.
 *
 * On mount, fetches GET /api/users/profile and uses the response to:
 *  1. Update the user object (latest points, quizzesTaken, adsWatched)
 *  2. Populate quiz history from the backend (persists across reloads)
 *
 * This fixes the bug where the profile page only showed session-local history.
 */
function Profile() {
  const { user, points, quizHistory, syncFromServer } = useUser()
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true)
      setError(null)
      try {
        // GET /api/users/profile returns:
        //   { success, user: {...toPublic()}, quizHistory: [...], rewardSummary: [...] }
        const data = await getUserProfile()

        // Hydrate context: updates user.points, quizzesTaken, adsWatched,
        // AND populates quizHistory array from the database
        syncFromServer(data)
      } catch (err) {
        // 401 = JWT expired or missing — user still sees cached data
        if (err?.status === 401) {
          setError('Session expired. Restart the app to refresh your profile.')
        } else if (err?.status !== undefined) {
          setError('Could not load profile. Showing cached data.')
        }
        // Network errors silently fall back to context data
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, []) // Only run once on mount — data is fresh from the login call too

  if (profileLoading) return <Loading message="Loading profile…" />

  const displayName = getDisplayName(user)
  const totalQuizzes = quizHistory.length

  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          quizHistory.reduce((sum, r) => sum + calcPercent(r.score, r.total), 0) /
            totalQuizzes
        )
      : 0

  const bestScore =
    totalQuizzes > 0
      ? Math.max(...quizHistory.map((r) => calcPercent(r.score, r.total)))
      : null

  return (
    <div className="min-h-screen bg-tg-darker px-4 pt-8 pb-4 page-enter">
      {/* ── Error banner ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* ── Profile header card ── */}
      <div className="bg-tg-card rounded-2xl p-5 border border-white/5 mb-5">
        <div className="flex flex-col items-center text-center gap-2 mb-4">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-tg-blue/40"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-tg-blue flex items-center justify-center text-white text-3xl font-bold ring-4 ring-tg-blue/40">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-lg font-bold text-tg-text">{displayName}</h1>
          {user?.username && (
            <p className="text-tg-hint text-sm">@{user.username}</p>
          )}
        </div>

        {[
          { label: 'Telegram ID', value: user?.telegram_id ?? '—' },
          {
            label: 'Full Name',
            value: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—',
          },
          {
            label: 'Member Since',
            value: user?.createdAt ? formatDate(user.createdAt) : '—',
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
          >
            <span className="text-tg-hint text-sm">{row.label}</span>
            <span className="text-tg-text text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {/* ── Points (server-confirmed) ── */}
      <PointsCard points={points} label="Total Points" highlight />

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { icon: '🧠', label: 'Quizzes', value: user?.quizzesTaken ?? totalQuizzes },
          { icon: '📊', label: 'Avg Score', value: `${avgScore}%` },
          { icon: '⭐', label: 'Best', value: bestScore !== null ? `${bestScore}%` : '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-tg-card rounded-2xl p-3 border border-white/5 text-center"
          >
            <p className="text-xl mb-1">{stat.icon}</p>
            <p className="text-tg-text font-bold text-base">{stat.value}</p>
            <p className="text-tg-hint text-[10px]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Ads watched stat ── */}
      {user?.adsWatched > 0 && (
        <div className="bg-tg-card rounded-2xl px-4 py-3 border border-white/5 mt-3 flex justify-between items-center">
          <span className="text-tg-hint text-sm">Total Ads Watched</span>
          <span className="text-tg-text font-bold">
            📺 {user.adsWatched}
          </span>
        </div>
      )}

      {/* ── Quiz history (loaded from backend) ── */}
      <div className="mt-6">
        <p className="text-tg-hint text-xs uppercase tracking-widest mb-3">
          Quiz History
        </p>

        {quizHistory.length === 0 ? (
          <div className="bg-tg-card rounded-2xl p-6 border border-white/5 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-tg-hint text-sm">No quizzes played yet.</p>
            <p className="text-tg-hint text-xs mt-1">
              Start a quiz to see your history here!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {quizHistory.map((result, idx) => {
              const pct = calcPercent(result.score, result.total)
              // Backend uses `pointsEarned`; local results use `earned`
              const earned = result.pointsEarned ?? result.earned ?? 0
              // Backend uses `createdAt`; local uses `date`
              const dateStr = result.createdAt ?? result.date

              return (
                <div
                  key={idx}
                  className="bg-tg-card rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                        pct >= 80
                          ? 'bg-green-500/20 text-green-400'
                          : pct >= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {pct}%
                    </div>
                    <div>
                      <p className="text-tg-text text-sm font-medium">
                        {result.score}/{result.total} correct
                      </p>
                      <p className="text-tg-hint text-xs">{formatDate(dateStr)}</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm font-bold">
                    +{formatPoints(earned)} pts
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
