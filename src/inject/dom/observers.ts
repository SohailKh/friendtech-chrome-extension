type ElementObserver = (
  selector: string,
  onElementAdded: () => void
) => MutationObserver;

// Track when an element matching the selector is added to the DOM
export const createProfileObserver: ElementObserver = (
  selector,
  onElementAdded
) => {
  return new MutationObserver((mutations_list) => {
    mutations_list.forEach((mutation) => {
      const addedNodes = mutation.addedNodes as unknown as HTMLElement[]; // wrong typings
      addedNodes.forEach((added_node) => {
        if (added_node.querySelector) {
          const element = added_node.querySelector(selector);
          if (!!element) {
            onElementAdded();
          }
        }
      });
    });
  });
};

// Check for any change
export function createNodeObserver(
  targetNode: Node,
  options: MutationObserverInit,
  callback: MutationCallback
): MutationObserver | null {
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, options);
  return observer;
}
