'use strict';

import './popup.css';
import { openPreview, openArticles } from './utils/utils';
import { saveArticle, setToStorage } from './utils/storage';

(function () {  
  async function collect() {
    try {
      console.log("collect");
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0]?.id) {
        const response = await chrome.tabs.sendMessage(
          tabs[0]?.id,
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
    } catch (error) {
      console.error("Error in collect function:", error);
    }
  }
  
  async function preview() {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0]?.id) {
        const response = await chrome.tabs.sendMessage(
          tabs[0]?.id,
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
    } catch (error) {
      console.error("Error in preview function:", error);
    }
  }
  
  async function manageArticles() {
    try {
      await openArticles();
    } catch (error) {
      console.error("Error in manageArticles function:", error);
    }
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
