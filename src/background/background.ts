import { StatsClient } from "./client/api";

chrome.scripting.registerContentScripts([
  {
    id: `main_context_inject_${Math.random()}`,
    world: "ISOLATED",
    matches: ["https://twitter.com/*"],
    js: ["./inject.js"],
    runAt: "document_idle",
  },
]);

// instantiate client
const client = new StatsClient();

type Message = {
  type: "fetchProfileData";
  profile: string;
};

async function getStats(profile: string) {
  try {
    console.log("attempting to fetch");
    const response = await fetch(
      `https://friendtech-ui.onrender.com/api/profile/${profile}`
    );
    console.log("Response:", response);
    if (!response.ok) {
      throw new Error("Network error");
    }
    const json = await response.json();
    console.log("Response json:", json);
    return json;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

// listen for messages sent from the extension
chrome.runtime.onMessage.addListener(
  (message: Message, sender: any, sendResponse: any) => {
    if (message.type === "fetchProfileData") {
      getStats(message.profile)
        .then((data) => {
          console.log("data:", data);
          if (!data) {
            // check for falsy value, not double negation (!!data)
            sendResponse({ success: false, error: "No data returned" });
          } else {
            console.log("data fetched:", data);
            sendResponse({ success: true, data: data });
          }
        })
        .catch((error) => {
          error.toString = function () {
            return `Error: ${this.message}`;
          };
          const errorString = error.toString();
          console.error("Error fetching data:", errorString);
          sendResponse({ success: false, error: errorString });
        });

      return true; // Indicates you will respond asynchronously
    }
  }
);
