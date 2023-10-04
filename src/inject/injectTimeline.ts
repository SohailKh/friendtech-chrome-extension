import { findUserNameElements } from "./dom/changeTextColor";

// We're gonna observe changes to the min-height style of the first child of
// '[aria-label="Timeline: Your Home Timeline"]' because that's really the only way of knowing if the timeline has changed.
function observeTargetNode(targetNode: Element): void {
  const callback: MutationCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        const prevHeight = mutation.oldValue?.match(/min-height: (\d+)/)?.[1];
        const newHeight = (targetNode as HTMLElement).style.minHeight;
        // lets make sure there is a change in height
        if (prevHeight !== newHeight) {
          findUserNameElements();
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, {
    attributes: true,
    attributeFilter: ["style"],
    attributeOldValue: true,
  });
}

// Function to check if the desired element is present, and if so, set up the observer for min-height changes
function checkForDesiredElement(): void {
  const parentDiv = document.querySelector(
    '[aria-label="Timeline: Your Home Timeline"]'
  );
  const targetNode = parentDiv ? parentDiv.firstElementChild : null;
  if (targetNode) {
    observeTargetNode(targetNode);
  }
}

// Initial check for the desired element
checkForDesiredElement();

// Set up an observer to watch for DOM changes, and check for the desired element when changes occur
const domObserver = new MutationObserver(checkForDesiredElement);
domObserver.observe(document, { childList: true, subtree: true });
