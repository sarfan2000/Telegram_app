import React from 'react'
import { getDisplayName } from '../utils/helpers.js'

/**
 * UserCard – displays the Telegram user's avatar, name, and username.
 *
 * Props:
 *  - user     : user object (telegram_id, first_name, last_name, username, photo_url)
 *  - compact  : boolean – smaller variant for tight spaces
 */
function UserCard({ user, compact = false }) {
  if (!user) return null

  const displayName = getDisplayName(user)
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'p-4'}`}>
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {user.photo_url ? (
          <img
            src={user.photo_url}
            alt={displayName}
            className={`rounded-full object-cover ring-2 ring-tg-blue/40 ${
              compact ? 'w-9 h-9' : 'w-14 h-14'
            }`}
          />
        ) : (
          // Fallback: coloured circle with initials
          <div
            className={`rounded-full flex items-center justify-center font-bold ring-2 ring-tg-blue/40 bg-tg-blue text-white ${
              compact ? 'w-9 h-9 text-sm' : 'w-14 h-14 text-xl'
            }`}
          >
            {initials}
          </div>
        )}

        {/* Online indicator dot */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-tg-dark" />
      </div>

      {/* Name & username */}
      <div className="min-w-0">
        <p
          className={`font-semibold text-tg-text truncate ${
            compact ? 'text-sm' : 'text-base'
          }`}
        >
          {displayName}
        </p>
        {user.username && (
          <p className="text-tg-hint text-xs truncate">@{user.username}</p>
        )}
      </div>
    </div>
  )
}

export default UserCard
