// ==UserScript==
// @name        ChatGPT extensions
// @namespace   Violentmonkey Scripts
// @match       https://chat.openai.com/chat
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description 08/01/2023, 14.25.43
// ==/UserScript==

const QUESTION_ASK_MORE = "Write the rest of the code";
const TXT_COMMAND_CAPTION = "Ask for the rest of the code until its done";
const APP_NAME = "CHATGPT_EXTENSIONS";
const POLL_INTERVAL = 1000;

const s = {
  log: (...x) => console.log(`[${APP_NAME}] `, ...x),
  debug: false,
};

const querySelectors = (x) => {
  return Array.from(document.querySelectorAll(x));
};

const getCells = (q) => {
  return q(".group.w-full");
};

const getTextArea = (q) => {
  return q(".flex.flex-col.w-full.py-2.flex-grow > textarea")[0];
};

const getSubmitButton = (q) => {
  return q(".flex.flex-col.w-full.py-2.flex-grow > button")[0];
};

const submitMessage = (q) => (msg) => {
  const area = getTextArea(q);
  const btn = getSubmitButton(q);
  area.value = msg;
  btn.click();
};

const isCellPlayer = (c) => {
  const image = c.querySelector("img");
  return Boolean(image);
};

const isCellChatbot = (c) => {
  return !isCellPlayer(c);
};

const getCellText = (cell) => {
  const el = cell.querySelector(".whitespace-pre-wrap");
  return el.textContent;
};

const onAskRestOfTheCode = ({ log, debug }) => {
  const q = querySelectors;

  let previousLastBotCellId = -1;
  let previousLastBotCellText = "";
  let previousIsWriting = false;

  let notWritingCount = 0;
  let canSendMessage = false;

  const poll = () => {
    const cells = getCells(q);

    let playerCells = [];
    let botCells = [];

    for (const c of cells) {
      const isPlayer = isCellPlayer(c);
      const isChatbot = isCellChatbot(c);

      if (isPlayer) playerCells.push(c);
      if (isChatbot) botCells.push(c);
    }

    const lastBotCellIndex = botCells.length - 1;
    const lastBotCell = botCells[lastBotCellIndex];

    if (lastBotCell) {
      const lastBotCellText = getCellText(lastBotCell);
      const isWriting =
        lastBotCellText.length > previousLastBotCellText.length ||
        lastBotCellIndex > previousLastBotCellId;

      previousLastBotCellText = lastBotCellText;
      previousLastBotCellId = lastBotCellIndex;

      if (!isWriting) {
        notWritingCount++;
        if (notWritingCount > 5 && canSendMessage) {
          log("Sending message to ask for more");
          submitMessage(q)(QUESTION_ASK_MORE);
          notWritingCount = 0;
          canSendMessage = false;
        }
      } else {
        notWritingCount = 0;
      }

      if (
        isWriting === false &&
        previousIsWriting === true &&
        lastBotCellText.length > 0
      ) {
        // Bot has stopped writing.
        canSendMessage = true;
      }

      if (debug) {
        log({
          notWritingCount,
          canSendMessage,
          isWriting,
          previousIsWriting,
          lastBotCellText,
        });
      }

      previousIsWriting = isWriting;
    }
  };

  poll();

  return setInterval(poll, POLL_INTERVAL);
};

const init = (services) => {
  const { log } = services;

  let interval = null;

  GM_registerMenuCommand(TXT_COMMAND_CAPTION, () => {
    clearInterval(interval);
    interval = onAskRestOfTheCode(services);
    log("STARTED " + interval);
  });

  GM_registerMenuCommand("CANCEL: " + TXT_COMMAND_CAPTION, () => {
    clearInterval(interval);
    log("CANCELLED");
  });

  log("INITIALIZED");
};

init(s);
