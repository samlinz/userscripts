// ==UserScript==
// @name        Reddit Video Downloader Redirect
// @namespace   samlinz
// @match       https://www.reddit.com/r/*
// @grant       GM_openInTab
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description 01/12/2022, 12.27.21
// ==/UserScript==

// Example
// https://redditsave.com/info?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fjerma985%2Fcomments%2Fyxgvdw%2Fsander_cohen_andy%2F
// https://sd.redditsave.com/download.php?permalink=https://reddit.com/r/jerma985/comments/z8phai/latam_dub_andy/&video_url=https://v.redd.it/n4qmp4hnt23a1/DASH_720.mp4?source=fallback&audio_url=https://v.redd.it/n4qmp4hnt23a1/DASH_audio.mp4?source=fallback

const getDownloadUrl = ({ href, isOpenMode, isDownloadMode }) => {
  const base = "https://redditsave.com/info?url=";
  const query = encodeURIComponent(href);
  const url = `${base}${query}`;
  return url;
}

const appName = "REDDIT_DOWNLOADER";
const log = (...x) => console.log(`[${appName}-${Date.now()}]`, ...x);

log("Starting");

const download = (mode) => {
  try {
    const href = location.href;

    const isOpenMode = mode === 1;
    const isDownloadMode = mode === 2;
    if ([isOpenMode, isDownloadMode].every(x => !x)) {
      throw Error("Invalid mode " + mode);
    }

    const newHref = getDownloadUrl({ href, isOpenMode, isDownloadMode });

    log(`${href} -> ${newHref}`);

    GM_openInTab(newHref, {});

    log("Done");
  } catch (e) {
    log("ERROR", e.message);
  }
}

GM_registerMenuCommand("Download Reddit Video - Page", download.bind(null, 1))
// GM_registerMenuCommand("Download Reddit Video - Download", download.bind(null, 2))
// Direct dl link not implemented