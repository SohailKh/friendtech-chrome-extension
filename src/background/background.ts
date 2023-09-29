import { StatsClient } from "./client/api";

chrome.scripting.registerContentScripts([
  {
    id: `main_context_inject_${Math.random()}`,
    world: "ISOLATED",
    matches: ["https://twitter.com/*"],
    js: ["./inject.js"],
  },
]);

// instantiate client
const client = new StatsClient();

type Message = {
  type: "fetchProfileData";
  profile: string;
};

// listen for messages sent from the extension and make appropriate request
chrome.runtime.onMessage.addListener(
  (message: Message, sender: any, sendResponse: any) => {
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

      return true; // Indicates you will respond asynchronously
    }
  }
);
