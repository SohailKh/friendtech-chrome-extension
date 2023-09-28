function injectStats(user: User) {
  // Locate the stats section using the UserName attribute
  const userNameElement = document.querySelector('[data-testid="UserName"]');
  if (!userNameElement) return;

  const statsSection = userNameElement.parentElement;
  if (!statsSection) return;

  const existingStat =
    findStatElementByText(statsSection, "Followers") ||
    findStatElementByText(statsSection, "Following");

  if (!existingStat) return;
  console.log("existingStat", existingStat);
  // Clone existing stat to keep its styles and structure
  const supplyStat = existingStat.parentElement?.cloneNode(true) as HTMLElement;
  const usdPriceStat = existingStat.parentElement?.cloneNode(
    true
  ) as HTMLElement;
  const ethPriceStat = existingStat.parentElement?.cloneNode(
    true
  ) as HTMLElement;
  // const addressStat = existingStat.cloneNode(true);

  // Modify the cloned stats with your new data
  updateLink(supplyStat, user.address, "Supply", user.supply.toLocaleString());
  updateLink(
    usdPriceStat,
    user.address,
    "Price (USD)",
    user.usdPrice.toLocaleString()
  );
  updateLink(
    ethPriceStat,
    user.address,
    "Price (ETH)",
    user.ethPrice.toLocaleString()
  );

  // Append the new stats below the existing stats in the parent container
  existingStat.parentElement?.parentElement?.appendChild(supplyStat);
  existingStat.parentElement?.parentElement?.appendChild(usdPriceStat);
  existingStat.parentElement?.parentElement?.appendChild(ethPriceStat);
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

function updateLink(
  div: HTMLElement,
  address: string,
  newValue: string,
  newText: string
): void {
  div.style.marginLeft = "20px";
  const formattedAddress = "https://www.friend.tech/rooms/" + address;
  if (div instanceof Element) {
    // Get the anchor element within the passed element
    const anchor = div.querySelector("a");

    if (anchor) {
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
        (valueSpan as HTMLElement).innerText = newText;
      } else {
        console.error("Value span not found.");
      }

      if (textSpan) {
        textSpan.innerText = "$" + Number(newValue).toFixed(2);
      } else {
        console.error("Text span not found.");
      }
    } else {
      console.error("Anchor element not found.");
    }
  } else {
    console.error("Element is not a div.");
  }
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

type User = {
  address: string;
  username: string;
  supply: number;
  usdPrice: number;
  ethPrice: number;
};

function getStats() {
  const profileName = getTwitterProfileFromURL();

  chrome.runtime.sendMessage(
    { type: "fetchProfileData", profile: profileName },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        const user = response.data as User;
        console.log("user", user);
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
      'Failed to find [data-testid="UserName"] after multiple retries.'
    );
  }
}

getStats();

// injectStats();
