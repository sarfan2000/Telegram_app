import React, { useState } from 'react'

/**
 * RewardButton – animated CTA button for watching a rewarded ad.
 *
 * Props:
 *  - onClick  : async function to trigger (handles ad + reward logic)
 *  - label    : button text
 *  - points   : number of points the user will earn
 *  - disabled : bool
 */
function RewardButton({
  onClick,
  label = 'Watch Ad & Earn Points',
  points = 10,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading || disabled) return
    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative w-full flex items-center justify-center gap-3
        px-6 py-4 rounded-2xl font-semibold text-base
        transition-all duration-200 overflow-hidden
        ${
          disabled
            ? 'bg-tg-hint/20 text-tg-hint cursor-not-allowed'
            : 'bg-gradient-to-r from-tg-blue to-blue-500 text-white active:scale-95 hover:shadow-lg hover:shadow-tg-blue/30'
        }
      `}
    >
      {/* Shimmer animation when idle */}
      {!disabled && !loading && (
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}

      {/* Loading spinner */}
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span>Loading ad…</span>
        </>
      ) : (
        <>
          <span className="text-xl">📺</span>
          <div className="text-left">
            <div>{label}</div>
            <div className="text-xs opacity-80 font-normal">
              Earn +{points} points
            </div>
          </div>
        </>
      )}
    </button>
  )
}

export default RewardButton
