/**
 * monetag.js – Monetag Direct Link Ad integration service.
 *
 * Flow:
 *  1. User clicks "Watch Ad"
 *  2. showRewardAd() is called
 *  3. Opens the Monetag Direct Link in a new tab
 *  4. Waits 5 seconds to simulate ad completion
 *  5. On success → resolve(true) → caller grants points
 */

const DIRECT_LINK_URL = 'https://omg10.com/4/11410343';

export const showRewardAd = () => {
  return new Promise((resolve) => {
    // Open the ad in a new window/tab
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
      window.Telegram.WebApp.openLink(DIRECT_LINK_URL);
    } else {
      window.open(DIRECT_LINK_URL, '_blank');
    }

    // Wait 5 seconds to simulate ad duration before rewarding points
    setTimeout(() => {
      resolve(true);
    }, 5000);
  });
};

export const isMonetagReady = () => {
  return true; // Direct links are always ready!
};
