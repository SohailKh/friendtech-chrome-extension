import { debounce } from "../utils/debounce";
// names we've checked
const sentUsernames = new Map<string, boolean>();
// names we will check
let usernamesToSend = new Set<string>();
// username spans that we potentially need to update with a new color
const usernameSpans = new Map<string, HTMLSpanElement[]>();

function checkUsernames() {
  if (usernamesToSend.size > 0) {
    chrome.runtime.sendMessage(
      { type: "checkExists", usernames: Array.from(usernamesToSend) },
      (response) => {
        response.data.forEach((item: { profile: string; exists: boolean }) => {
          const spans = usernameSpans.get(item.profile);
          // add color to text if they return true
          if (item.exists) {
            spans?.forEach((span) => {
              span.classList.add("animate-color");
            });
          }

          sentUsernames.set(item.profile, item.exists);
          usernamesToSend.delete(item.profile);
          usernameSpans.delete(item.profile);
        });
      }
    );
  }
}

// Don't overload my cheap server with extraneous requests.
const debouncedCheckUsernames = debounce(checkUsernames, 1200);

// Find username elements, store them locally, and then send them to the background script to check if they exist
export function findUserNameElements() {
  // Find all the container elements using data-testid attribute
  const containers = document.querySelectorAll('[data-testid="User-Name"]');
  containers.forEach((container) => {
    // Convert NodeList to array to use array methods
    const spans = Array.from(container.querySelectorAll("span"));

    // Iterate through the spans to find the one containing the username
    spans.forEach((span) => {
      if (span.textContent && span.textContent.startsWith("@")) {
        // Extract the username, remove the '@' symbol
        const username = span.textContent.slice(1);

        // Check if the username has already been sent
        if (sentUsernames.has(username)) {
          // If the username has been sent before, update its color based on the saved existence status
          const exists = sentUsernames.get(username);
          if (exists) {
            span.classList.add("animate-color");
          }
        } else {
          // If the username hasn't been sent before, add it to the Set to be sent
          usernamesToSend.add(username);
          // Store a reference to the span element in the Map
          usernameSpans.set(
            username,
            usernameSpans.get(username)?.concat(span) || [span]
          );

          debouncedCheckUsernames();
        }
      }
    });
  });
}
