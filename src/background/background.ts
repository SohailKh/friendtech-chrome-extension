import { StatsClient } from "./client/api";

chrome.scripting.registerContentScripts([
  {
    id: `main_context_inject_${Math.random()}`,
    world: "ISOLATED",
    matches: [
      "https://twitter.com/*",
      "https://x.com/",
      "https://x.com/*",
      "https://twitter.com/",
    ],
    js: ["./injectProfile.js", "./injectTimeline.js"],
    css: ["./inject.css"],
  },
]);

// instantiate client
const client = new StatsClient();

// listen for messages sent from the extension and make appropriate request
chrome.runtime.onMessage.addListener(
  (message: any, sender: any, sendResponse: any) => {
    if (message.type === "fetchProfileData") {
      client
        .getStats(message.profile)
        .then((data: any) => {
          if (!data) {
            sendResponse({ success: false, error: "No data returned" });
          } else {
            sendResponse({ success: true, data: data });
          }
        })
        .catch((error: Error) => {
          error.toString = function () {
            return `Error: ${this.message}`;
          };
          const errorString = error.toString();
          sendResponse({ success: false, error: errorString });
        });

      return true;
    }

    if (message.type === "checkExists") {
      client.checkIfExists(message.usernames).then((data: [ProfileStatus]) => {
        console.log(data);
        if (!data) {
          sendResponse({ success: false, error: "No data returned" });
        } else {
          sendResponse({ success: true, data: data });
        }
      });
      return true;
    }
  }
);

export type ProfileStatus = {
  exists: boolean;
  username: string;
};
