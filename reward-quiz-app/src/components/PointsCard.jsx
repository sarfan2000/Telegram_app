import React from 'react'
import { formatPoints } from '../utils/helpers.js'

/**
 * PointsCard – shows the user's current point balance with a coin icon.
 *
 * Props:
 *  - points   : number
 *  - label    : string (default "Your Points")
 *  - highlight: boolean – adds a glowing blue accent
 */
function PointsCard({ points = 0, label = 'Your Points', highlight = false }) {
  return (
    <div
      className={`rounded-2xl p-4 flex items-center gap-4 transition-all ${
        highlight
          ? 'bg-gradient-to-r from-tg-blue/20 to-tg-button/30 border border-tg-blue/30'
          : 'bg-tg-card border border-white/5'
      }`}
    >
      {/* Coin icon */}
      <div className="w-12 h-12 rounded-full bg-yellow-400/15 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">🪙</span>
      </div>

      <div>
        <p className="text-tg-hint text-xs uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-tg-text mt-0.5">
          {formatPoints(points)}
        </p>
      </div>

      {/* Decorative sparkle on highlighted card */}
      {highlight && (
        <div className="ml-auto text-xl opacity-70">✨</div>
      )}
    </div>
  )
}

export default PointsCard
