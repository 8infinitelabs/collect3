'use strict';

import { getOrCreateToken, uploadFile } from "./utils/backend";
import { fromHtmlToBase64, fromLocalOnlyToMultipleRemotes } from "./utils/migrations";
import { getActiveStorage, getArticleContent, getArticles, getFromStorage } from "./utils/storage";
import { Metadata } from "./utils/utils";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((
  request: {
    type: string,
    payload: any,
  },
  sender,
  sendResponse,
) => {
  if (request.type === 'toBase64') {
    fromLocalOnlyToMultipleRemotes()
    .then(() => fromHtmlToBase64())
    .then(() => sendResponse({message:'Done'}))
    .catch(() => sendResponse({message:'Error'}));
  }
  if (request.type === 'sync') {
    const { url } = request.payload;
    const upload = async () => {
      try {
        const storage = await getActiveStorage();
        const articles = await getArticles();
        const file = await getArticleContent(url);
        const metadata = articles.get(url);

        let cid: string;
        try {
          const result = await uploadFile(url, file, metadata as Metadata, storage)
          cid = result.cid;
        } catch(err: any) {
          if (err.message === "Invalid Token") {
            await getOrCreateToken(storage);
            const result = await uploadFile(url, file, metadata as Metadata, storage)
            cid = result.cid;
          } else {
            throw err;
          }
        }

        sendResponse({
          message:'Done',
          payload: {
            cid: cid,
          },
        })
      } catch (err) {
        console.log(err);
        sendResponse({message:'Error'})
      }
    };
    upload();
  }
  if (request.type === 'syncAll') {
    const upload = async () => {
      try {
        const storage = await getActiveStorage();
        const rawArticles = await getFromStorage(storage.url);
        const articles: [[string,Metadata]] = JSON.parse(rawArticles);
        const requests = articles.map(async ([url, metadata]) => {
          const file = await getArticleContent(url);
          return uploadFile(url, file, metadata as Metadata, storage)
        });

        const results = await Promise.allSettled(requests);
        console.log(results);

        sendResponse({
          message:'Done',
          payload: {
            cids: results,
          },
        })
      } catch (err) {
        console.log(err);
        sendResponse({message:'Error'})
      }
    };
    upload();
  }
  if (request.type === 'createAccount') {
    const create = async () => {
      try {
        const storage = await getActiveStorage();
        if (storage.shouldSync && !storage.auth_token) {
          const token = await getOrCreateToken(storage);
          sendResponse({
            message:'Done',
            payload: {
              token,
            },
          })
          return;
        }
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
