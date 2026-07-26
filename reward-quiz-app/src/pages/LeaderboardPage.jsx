import React, { useEffect, useState, useCallback } from 'react'
import { useUser } from '../context/UserContext.jsx'
import { getLeaderboard } from '../services/api.js'
import Leaderboard from '../components/Leaderboard.jsx'
import Loading from '../components/Loading.jsx'
import { formatPoints } from '../utils/helpers.js'

// Mock leaderboard data used when the backend is unavailable
const MOCK_LEADERBOARD = [
  { telegram_id: 1, username: 'quizking', first_name: 'Quiz', last_name: 'King', points: 4850, rank: 1 },
  { telegram_id: 2, username: 'brainiac', first_name: 'Brain', last_name: 'Iac', points: 3920, rank: 2 },
  { telegram_id: 3, username: 'smarty', first_name: 'Smart', last_name: 'Y', points: 3100, rank: 3 },
  { telegram_id: 4, username: 'player4', first_name: 'Player', last_name: 'Four', points: 2500, rank: 4 },
  { telegram_id: 5, username: 'player5', first_name: 'Player', last_name: 'Five', points: 1800, rank: 5 },
  { telegram_id: 6, username: 'player6', first_name: 'Player', last_name: 'Six', points: 1200, rank: 6 },
  { telegram_id: 7, username: 'player7', first_name: 'Player', last_name: 'Seven', points: 980, rank: 7 },
  { telegram_id: 8, username: 'player8', first_name: 'Player', last_name: 'Eight', points: 750, rank: 8 },
]

/**
 * LeaderboardPage – fetches and displays the top users ranked by points.
 */
function LeaderboardPage() {
  const { user, points } = useUser()

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userRank, setUserRank] = useState(null)

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const data = await getLeaderboard()
      const list = Array.isArray(data) ? data : data?.users ?? MOCK_LEADERBOARD
      setEntries(list)

      // Find current user's rank
      const idx = list.findIndex((e) => e.telegram_id === user?.telegram_id)
      setUserRank(idx >= 0 ? idx + 1 : null)
    } catch {
      setEntries(MOCK_LEADERBOARD)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.telegram_id])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  if (loading) return <Loading message="Loading leaderboard…" />

  return (
    <div className="min-h-screen bg-tg-darker px-4 pt-8 pb-4 page-enter">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-tg-text">Leaderboard 🏆</h1>
          <p className="text-tg-hint text-sm">Top players this week</p>
        </div>
        {/* Refresh button */}
        <button
          onClick={() => fetchLeaderboard(true)}
          disabled={refreshing}
          className="w-9 h-9 rounded-full bg-tg-card border border-white/10 flex items-center justify-center text-tg-hint active:scale-90 transition-all"
        >
          <span className={`text-base ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
        </button>
      </div>

      {/* ── Top 3 podium ── */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {/* 2nd place */}
          <PodiumCard entry={entries[1]} rank={2} />
          {/* 1st place */}
          <PodiumCard entry={entries[0]} rank={1} tall />
          {/* 3rd place */}
          <PodiumCard entry={entries[2]} rank={3} />
        </div>
      )}

      {/* ── Current user's rank banner (if outside top 3) ── */}
      {userRank && userRank > 3 && (
        <div className="bg-tg-blue/10 border border-tg-blue/30 rounded-2xl px-4 py-3 flex items-center justify-between mb-5">
          <span className="text-tg-text text-sm font-medium">Your Rank</span>
          <div className="flex items-center gap-3">
            <span className="text-tg-blue font-bold">#{userRank}</span>
            <span className="text-tg-text text-sm">{formatPoints(points)} pts</span>
          </div>
        </div>
      )}

      {/* ── Full list (4th onward) ── */}
      <p className="text-tg-hint text-xs uppercase tracking-widest mb-3">All Rankings</p>
      <Leaderboard entries={entries} currentUser={user} />
    </div>
  )
}

// ── Podium card sub-component ─────────────────────────────────────────────────
function PodiumCard({ entry, rank, tall = false }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const name = entry.first_name || entry.username || `Player ${rank}`
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className={`flex flex-col items-center gap-1 flex-1 ${tall ? 'mb-0' : 'mb-4'}`}>
      {/* Medal */}
      <span className="text-2xl">{medals[rank]}</span>

      {/* Avatar */}
      {entry.photo_url ? (
        <img
          src={entry.photo_url}
          alt={name}
          className={`rounded-full object-cover ring-2 ${
            rank === 1 ? 'ring-yellow-400 w-14 h-14' : 'ring-tg-hint/40 w-11 h-11'
          }`}
        />
      ) : (
        <div
          className={`rounded-full bg-tg-blue flex items-center justify-center text-white font-bold ring-2 ${
            rank === 1 ? 'ring-yellow-400 w-14 h-14 text-xl' : 'ring-tg-hint/40 w-11 h-11 text-base'
          }`}
        >
          {initial}
        </div>
      )}

      {/* Name */}
      <p className="text-tg-text text-xs font-semibold truncate max-w-[70px] text-center">
        {name}
      </p>

      {/* Points */}
      <div
        className={`rounded-xl px-2 py-1 text-xs font-bold ${
          rank === 1
            ? 'bg-yellow-400/20 text-yellow-400'
            : rank === 2
            ? 'bg-gray-400/20 text-gray-300'
            : 'bg-orange-400/20 text-orange-400'
        }`}
      >
        {formatPoints(entry.points)}
      </div>
    </div>
  )
}

export default LeaderboardPage
