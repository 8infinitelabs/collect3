'use strict';

import './popup.css';
import { openPreview, openArticles } from './utils/utils';
import { saveArticle, setToStorage } from './utils/storage';

(function () {  
  async function collect() {
    console.log("collect");
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0].id) {
      const response = await chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getHtml" },
      );
      console.log("response", response);
      if(response === undefined) {
        console.warn("failed to get article content");
        return undefined;
      }
      await saveArticle(response.url, response.article);
      await openPreview(response.url);
    }
  }

  async function preview() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0].id) {
      const response = await chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getHtml" },
      );
      console.log("response", response);
      if(response === undefined) {
        console.warn("failed to get article content");
        return undefined;
      }
      const key = 'preview' 
      await setToStorage(
        key,
        `<html><head></head><body>${response.article!.content}</body></html>`,
      );
      await openPreview('preview', response.article!.title);
    }
  }

  async function manageArticles() {
    await openArticles();
  }
  
  function setupListeners() {
    document.getElementById("previewBtn")!.addEventListener("click", () => {
      preview();
    });

    document.getElementById("collectBtn")!.addEventListener("click", () => {
      collect();
    });

    document.getElementById("manageBtn")!.addEventListener("click", () => {
      manageArticles();
    });
  }
  
  document.addEventListener("DOMContentLoaded", setupListeners);
})();
