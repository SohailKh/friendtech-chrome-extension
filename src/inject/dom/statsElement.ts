/*
 * This file is loaded as a content script on the following pages:
 * - https://twitter.com/[username], https://x.com/[username],
 */

import { User } from "../user/user";

let supplyStat: HTMLElement;
let usdPriceStat: HTMLElement;
let ethPriceStat: HTMLElement;

// Places additional friendtech stats on the user's profile page
export function injectStats(user: User) {
  // Locate the stats section using the UserName attribute and then going to its parent
  const statsSection = document.querySelector(
    '[data-testid="UserName"]'
  )?.parentElement;
  if (!statsSection) return;

  // Find an element that has followers or following
  const existingStat =
    findFollowElement(statsSection, "Followers") ||
    findFollowElement(statsSection, "Following");

  if (!existingStat) return;

  // Clone existing stat we found to keep its styles and structure
  supplyStat = existingStat.parentElement?.cloneNode(true) as HTMLElement;
  usdPriceStat = existingStat.parentElement?.cloneNode(true) as HTMLElement;
  ethPriceStat = existingStat.parentElement?.cloneNode(true) as HTMLElement;

  // Modify the cloned stats with our new data
  replaceStat(supplyStat, user.address, "Supply", user.supply.toLocaleString());
  replaceStat(
    usdPriceStat,
    user.address,
    "USD",
    user.usdPrice.toLocaleString(),
    true
  );
  replaceStat(
    ethPriceStat,
    user.address,
    "ETH",
    user.ethPrice.toLocaleString()
  );

  // make the followers/following be margin-right: 20px
  updateMarginsOnExistingElements(statsSection);

  // Append the new stats to be aligned next to the existing ones
  existingStat.parentElement?.parentElement?.appendChild(supplyStat);
  existingStat.parentElement?.parentElement?.appendChild(usdPriceStat);
  existingStat.parentElement?.parentElement?.appendChild(ethPriceStat);
}

// Removes the stats we added to the user's profile page
export function removeAllAddedStats() {
  if (supplyStat || usdPriceStat || ethPriceStat) {
    supplyStat.remove();
    usdPriceStat.remove();
    ethPriceStat.remove();
  }
}

// Finds the <a> tag that contains a follower/following count
//
// We first find the span that contains the text "Followers" or "Following".
// We then find the parent element that is an <a> tag. Voila
function findFollowElement(container: Element, text: string) {
  const element = Array.from(container.querySelectorAll("span")).find(
    (el: Element) => el.textContent?.includes(text)
  );
  if (!element) return null;

  let parent = element.parentElement;
  while (parent && parent.tagName !== "A") {
    parent = parent.parentElement;
  }

  return parent;
}

// The follow elements that we are cloning are actually <a> tags.
// Therefore, we find the <a> tag in a given element and update its href attribute.
// We also update the text to reflect what this stat is representing.
function replaceStat(
  div: HTMLElement,
  address: string,
  newValue: string,
  newText: string,
  isUSD: boolean = false
): void {
  div.style.marginRight = "20px"; // Add some spacing between the stats

  if (div instanceof Element) {
    // Get the anchor element within the passed element
    const anchor = div.querySelector("a");

    if (anchor) {
      const formattedAddress = "https://www.friend.tech/rooms/" + address;
      // Update the href attribute
      anchor.setAttribute("href", formattedAddress);
      // Get the span elements
      const valueSpan = anchor.querySelector("span span");
      const textSpan = Array.from(anchor.querySelectorAll("span")).find(
        (span) => {
          return (
            span.textContent?.includes("Following") ||
            span.textContent?.includes("Followers")
          );
        }
      );

      if (valueSpan) {
        const text = isUSD ? "$" + newText : newText;
        (valueSpan as HTMLElement).innerText = text;
      }

      if (textSpan) {
        textSpan.innerText = newValue;
      }
    }
  }
}

function updateMarginsOnExistingElements(container: Element) {
  const following = findFollowElement(container, "Following");
  const followers = findFollowElement(container, "Followers");
  const subscriptions = findFollowElement(container, "Subscriptions");

  if (following?.parentElement) {
    following.parentElement.style.marginRight = "20px";
  }
  if (followers?.parentElement) {
    followers.parentElement.style.marginRight = "20px";
  }
  if (subscriptions?.parentElement) {
    subscriptions.parentElement.style.marginRight = "20px";
  }
}
