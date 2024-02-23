'use strict';

import { fromHtmlToBase64, fromLocalOnlyToMultipleRemotes } from "./utils/migrations";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'toBase64') {
    fromLocalOnlyToMultipleRemotes()
    .then(() => fromHtmlToBase64())
    .then(() => sendResponse({message:'Done'}))
    .catch(() => sendResponse({message:'Error'}));
  }
  if (request.type === 'sync') {
    sendResponse({message:'Done'})
  }
  return true;
});
