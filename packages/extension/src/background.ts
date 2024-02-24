'use strict';

import { getOrCreateToken } from "./utils/backend";
import { fromHtmlToBase64, fromLocalOnlyToMultipleRemotes } from "./utils/migrations";
import { getActiveStorage } from "./utils/storage";

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
  if (request.type === 'createAccount') {
    const create = async () => {
      try {
        const storage = await getActiveStorage();
        console.table({storage});
        if (storage.shouldSync && !storage.auth_token) {
          const token = await getOrCreateToken(storage);
          console.table({token});
          sendResponse({message:'Done'})
          return;
        }
        console.log('no should sync');
        sendResponse({message:'Done'})
      } catch (err) {
        console.log(err);
        sendResponse({message:'Error'})
      }
    };
    create()
  }
  return true;
});
