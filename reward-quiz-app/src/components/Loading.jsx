import React from 'react'

/**
 * Loading – full-screen spinner shown during initial app load / API calls.
 */
function Loading({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tg-darker gap-4">
      {/* Animated ring */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-tg-card" />
        <div className="absolute inset-0 rounded-full border-4 border-tg-blue border-t-transparent animate-spin" />
      </div>

      {/* Telegram-style logo placeholder */}
      <div className="text-3xl">⚡</div>

      <p className="text-tg-hint text-sm tracking-wide">{message}</p>
    </div>
  )
}

export default Loading
