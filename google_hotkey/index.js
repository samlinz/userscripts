// ==UserScript==
// @name        Google HotKeys
// @namespace   Violentmonkey Scripts
// @match       https://www.google.com/search
// @grant       none
// @version     1.0
// @author      -
// @description Use hotkeys (shift + number) to navigate to numbered Google results.
// @run-at document-idle
// ==/UserScript==

const options = {
  prependNumber: true,
  openInTab: false,
  keys: {
    1: "!",
    2: '"',
    3: "#",
    4: "¤",
    5: "%",
    6: "&",
    7: "/",
    8: "(",
    9: ")",
  }
}

const getFetchSearchResultElements = (fn) => () => fn("#search [data-sokoban-container] [data-header-feature='0'] a[rel='noreferrer noopener']:not([href^='https://translate.google.com'])");
const fetchSearchResultElements = getFetchSearchResultElements(document.querySelectorAll.bind(document));
const checkIfLoaded = () => !!getFetchSearchResultElements(document.querySelector.bind(document))();

const run = ({ doc, options: { prependNumber, keys, openInTab } }) => {
  // Match all outbound links for search results (not misc. links like translations).
  let i = 1;
  const fe = document.querySelector("h2 + [data-hveid][data-ved] a"); // First element which sometimes is different, differs from others.
  const as = Array.from([fe || null, ...fetchSearchResultElements()].filter(x => !!x));
  const keysInverted = Object.fromEntries(
    Object.entries(
      keys
    ).map(([x, y]) => [y, x])
  );
  
  // Extract properties from search results.
  const x1 = as.map(a => {
    let ii = i++;
    const href = a.getAttribute("href");
    const titleEl = a.querySelector("h1,h2,h3,h4,h5");
    console.log({ a, ii, titleEl, href})
    const name = titleEl.textContent;
    const newName = `${ii}. ${name}`;
    return {
      titleEl,
      name: newName,
      href
    }
  });
  
  // Add numbers in front of results.
  if (prependNumber) x1.forEach(({ titleEl, name }) => titleEl.textContent = name);
  console.log(keysInverted)
  // Listen to keys and redirect to matching search result.
  window.addEventListener("keydown", ({ code, key }) => {
    const selection = keysInverted[key];
    if (!selection) return;
    const target = x1[Number(selection) - 1];
    if (!target) return;
    const { href } = target;
    if (openInTab) {
      window.open(href, "_blank");
    } else {
      window.location.href = href;
    }
  })
}

const maybeRun = (i, props) => {
  if (i > 100) return;
  if (!checkIfLoaded()) return setTimeout(maybeRun.bind(null, i + 1, props), 16);
  run(props);
}

maybeRun(1, {
  doc: document,
  options
});