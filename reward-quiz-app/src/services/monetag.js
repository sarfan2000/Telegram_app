/**
 * monetag.js – Monetag Rewarded Ad integration service.
 *
 * Monetag injects a global `show_9516131` function (or similar, based on zone)
 * after their SDK script is loaded.  The zone ID comes from .env.
 *
 * Flow:
 *  1. User clicks "Watch Ad"
 *  2. showRewardAd() is called
 *  3. Monetag shows the ad
 *  4. On success → resolve(true)  → caller grants points
 *  5. On failure → reject(Error)  → caller shows error message
 */

const ZONE_ID = import.meta.env.VITE_MONETAG_ZONE_ID || ''

/**
 * Dynamically inject the Monetag SDK script if it hasn't been loaded yet.
 * @returns {Promise<void>}
 */
const loadMonetagSDK = () => {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.__monetag_loaded) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://ophoacam.com/v1.0/sdk.js?key=${ZONE_ID}`
    script.async = true

    script.onload = () => {
      window.__monetag_loaded = true
      resolve()
    }

    script.onerror = () => {
      if (import.meta.env.DEV) {
        console.warn('[Monetag] Failed to load SDK, resolving to allow dev simulation.')
        resolve()
      } else {
        reject(new Error('Failed to load Monetag SDK. Check your Zone ID.'))
      }
    }

    document.head.appendChild(script)
  })
}

/**
 * Show a Monetag rewarded interstitial ad.
 *
 * @returns {Promise<boolean>} Resolves true on successful ad completion,
 *                             rejects with Error on failure or dismissal.
 */
export const showRewardAd = async () => {
  // Ensure SDK is loaded
  try {
    await loadMonetagSDK()
  } catch (err) {
    throw err
  }

  return new Promise((resolve, reject) => {
    // Monetag exposes show_<zoneId> or a generic window.show_monetag
    // Check both patterns for compatibility
    const showFn =
      window[`show_${ZONE_ID}`] ||
      window.show_monetag ||
      window.Monetag?.showAd

    if (typeof showFn !== 'function') {
      // Development / no SDK fallback – simulate a successful ad
      if (import.meta.env.DEV) {
        console.warn('[Monetag] SDK function not found. Simulating ad in DEV mode.')
        setTimeout(() => resolve(true), 1500)
        return
      }
      reject(new Error('Monetag SDK not initialised. Please check your Zone ID.'))
      return
    }

    try {
      showFn()
        .then(() => {
          // Ad was watched to completion
          resolve(true)
        })
        .catch((err) => {
          // Ad was skipped, failed, or not filled
          reject(new Error(err?.message || 'Ad was not completed.'))
        })
    } catch (err) {
      reject(new Error('Failed to show ad: ' + err.message))
    }
  })
}

/**
 * Check whether the Monetag SDK is ready.
 * @returns {boolean}
 */
export const isMonetagReady = () => {
  return !!(
    window.__monetag_loaded &&
    (window[`show_${ZONE_ID}`] || window.show_monetag || window.Monetag?.showAd)
  )
}
