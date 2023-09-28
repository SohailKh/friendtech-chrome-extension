// content.js

import { createObserver } from "./dom/create_observer";

// observe dom tree to detect username section when added
const observer = createObserver('div[data-testid="UserName"]', injectStats);
const reactRoot = document.querySelector("#react-root") as unknown as Node;
observer.observe(reactRoot, { subtree: true, childList: true });

function injectStats(statsSection: Element) {
  const existingStat =
    findStatElementByText(statsSection, "Followers") ||
    findStatElementByText(statsSection, "Following");

  if (!existingStat) return;

  // Clone existing stat to keep its styles and structure
  const newStat1 = existingStat.cloneNode(true);
  const newStat2 = existingStat.cloneNode(true);

  // Modify the cloned stats with your new data
  updateStat(newStat1, "NewStat1", "12345");
  updateStat(newStat2, "NewStat2", "67890");

  // Append the new stats below the existing stats in the parent container
  const parentContainer = statsSection.parentElement;
  parentContainer?.appendChild(newStat1);
  parentContainer?.appendChild(newStat2);
}

function findStatElementByText(container: Element, text: string) {
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

function updateStat(statElement: any, statName: string, statValue: string) {
  // Find the element that contains the name of the stat and update it
  const nameElement: any = Array.from(
    statElement.querySelectorAll("span")
  ).find(
    (el: any) =>
      el.textContent.includes("Following") ||
      el.textContent.includes("Followers")
  );
  const valueElement = nameElement ? nameElement.nextElementSibling : null;

  if (nameElement) nameElement.textContent = statName;
  if (valueElement) valueElement.textContent = statValue;
}

function getTwitterProfileFromURL() {
  const pathname = window.location.pathname;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && parts[0] !== "hashtag" && parts[0] !== "i") {
    return parts[0];
  }
  return null;
}

function getStats() {
  const profileName = getTwitterProfileFromURL();

  chrome.runtime.sendMessage(
    { action: "fetchProfileData", profileName: profileName },
    function (response) {
      console.log(response);
    }
  );
}

getStats();

// injectStats();
