import { StatsClient } from "./client/api";

chrome.scripting.registerContentScripts([
  {
      id: `main_context_inject_${Math.random()}`,
      world: "ISOLATED",
      matches: ["https://twitter.com/*"],
      js: ["lib/inject.js"],
      css: ["css/inject.css"],
  },
]);

// instantiate client
const client = new StatsClient()

type Message = {
  type: 'fetchProfileData';
  profile: string;
}

// listen for messages sent from the extension
chrome.runtime.onMessage.addListener((message: Message, sender: any, sendResponse: any) => {
  if (!message.type) {
      return;
  }

  switch(message.type) {
      case 'fetchProfileData':
          client.getStats(message.profile).then(
              async (data) => {
                  if (!data) {
                      return sendResponse(undefined);
                  }
                  console.log("data fetched:", data);
                  sendResponse({ success: true, data: data });
              }, 
              () => sendResponse(undefined)
          );
          break;
  }

  return true;
});