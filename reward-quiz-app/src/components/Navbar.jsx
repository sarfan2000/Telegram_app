import React from 'react'
import { NavLink } from 'react-router-dom'

/**
 * Navbar – fixed bottom tab bar with Telegram-style icons.
 * Active tab is highlighted in Telegram blue.
 */
const TABS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/quiz', label: 'Quiz', icon: '🧠' },
  { to: '/reward', label: 'Reward', icon: '🎁' },
  { to: '/leaderboard', label: 'Top', icon: '🏆' },
  { to: '/profile', label: 'Me', icon: '👤' },
]

function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
      {/* Frosted glass background */}
      <div
        className="flex items-center justify-around px-2 py-2"
        style={{
          background: 'rgba(23, 33, 43, 0.92)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-tg-blue scale-105'
                  : 'text-tg-hint hover:text-tg-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl leading-none">{tab.icon}</span>
                <span
                  className={`text-[10px] font-medium tracking-wide ${
                    isActive ? 'text-tg-blue' : 'text-tg-hint'
                  }`}
                >
                  {tab.label}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-tg-blue mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navbar
