import React from 'react'
import { formatPoints, rankMedal, getDisplayName } from '../utils/helpers.js'

/**
 * Leaderboard – renders the top-users table.
 *
 * Props:
 *  - entries     : array of { rank, username, first_name, last_name, points, photo_url }
 *  - currentUser : the logged-in user object (to highlight their row)
 */
function Leaderboard({ entries = [], currentUser }) {
  if (!entries.length) {
    return (
      <div className="text-center py-10 text-tg-hint">
        <p className="text-3xl mb-2">🏆</p>
        <p>No entries yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry, idx) => {
        const rank = entry.rank ?? idx + 1
        const isCurrentUser =
          currentUser && entry.telegram_id === currentUser.telegram_id
        const name = getDisplayName(entry)
        const initials = name.charAt(0).toUpperCase()

        return (
          <div
            key={entry.telegram_id ?? idx}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
              isCurrentUser
                ? 'bg-tg-blue/15 border-tg-blue/40'
                : 'bg-tg-card border-white/5'
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center font-bold text-sm flex-shrink-0">
              {rankMedal(rank)}
            </div>

            {/* Avatar */}
            {entry.photo_url ? (
              <img
                src={entry.photo_url}
                alt={name}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-tg-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initials}
              </div>
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-tg-text text-sm font-medium truncate">
                {name}
                {isCurrentUser && (
                  <span className="ml-1 text-[10px] text-tg-blue">(you)</span>
                )}
              </p>
              {entry.username && (
                <p className="text-tg-hint text-xs truncate">
                  @{entry.username}
                </p>
              )}
            </div>

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <p className="text-tg-text font-bold text-sm">
                {formatPoints(entry.points)}
              </p>
              <p className="text-tg-hint text-[10px]">pts</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Leaderboard
