/**
 * monetag.js – Monetag SDK integration service.
 */

// Function called when the user clicks 'Watch Ad' to earn points
export const showRewardAd = () => {
  return new Promise((resolve, reject) => {
    // Check if the Monetag script has successfully loaded the function
    if (typeof window.show_11434314 === 'function') {

      // Call the Rewarded Popup ad format
      window.show_11434314('pop').then(() => {
        // User watched the ad till the end
        resolve(true);
      }).catch(e => {
        // User closed early or an error occurred
        console.error("Ad error or closed early:", e);
        reject(new Error("Ad not completed or failed."));
      });

    } else {
      console.error("Monetag SDK is not loaded.");
      reject(new Error("Ad blockers prevented the ad from loading."));
    }
  });
};

export const isMonetagReady = () => {
  return typeof window.show_11434314 === 'function';
};
