import { createProfileObserver } from "./dom/observers";
import { injectStats, removeAllAddedStats } from "./dom/statsElement";
import { User } from "./user/user";

let fetchingStats = false;
// We use this observer to track when the user navigates to a new profile
// We use div[data-testid="cellInnerDiv" as the thing to observe as it's
// basically the user's first tweet. Using other ones can be more finicky as
// the profile dom doesn't always get recreated when navigating to a new
// profile. However, a user tweet's are always recreated.
const observer = createProfileObserver(
  'div[data-testid="cellInnerDiv"]',
  () => {
    if (isNewProfile()) {
      // remove old stats in case dom not recreated
      removeAllAddedStats();
      // get new stats
      if (!fetchingStats) {
        getStats();
        fetchingStats = true;
      }
    }
  }
);

observer.observe(document.body, { childList: true, subtree: true });

let currentProfile = "";

// Checks if the user has navigated to a new profile and stores the new profile
// if applicable
function isNewProfile() {
  const pathname = window.location.pathname;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && parts[0] !== "hashtag" && parts[0] !== "i") {
    if (currentProfile !== parts[0]) {
      currentProfile = parts[0]; // if new, store
      return true;
    }
  }
  return false;
}

function getStats() {
  chrome.runtime.sendMessage(
    { profile: currentProfile, type: "fetchProfileData" },
    (response) => {
      fetchingStats = false;
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        const user = response.data as User;
        if (user) {
          waitForElement(user);
        }
      }
    }
  );
}

let retries = 10;

function waitForElement(user: User) {
  const userNameElement = document.querySelector('[data-testid="UserName"]');
  if (userNameElement) {
    injectStats(user);
  } else if (retries > 0) {
    retries--;
    setTimeout(() => waitForElement(user), 500); // retry every 500ms
  } else {
    console.error(
      "Failed to find username div after multiple retries. This is likely due to a change in the Twitter DOM. DM me on friendtech if you need it to be updated."
    );
  }
}
