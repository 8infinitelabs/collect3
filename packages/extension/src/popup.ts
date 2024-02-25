'use strict';

import './popup.css';
import { openPreview, openPage, articleContentToHtml, Article } from './utils/utils';
import { saveArticle, setToStorage } from './utils/storage';

(function () {
  async function collect() {
    try {
      console.log("collect");
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0]?.id) {
        const response: { url: string, article: Article } = await chrome.tabs.sendMessage(
          tabs[0]?.id,
          { type: "getHtml" },
        );
        console.log("response", response);
        if (response === undefined) {
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
        const response: { article: Article } = await chrome.tabs.sendMessage(
          tabs[0]?.id,
          { type: "getHtml" },
        );
        if(response === undefined) {
          console.warn("failed to get article content");
          return undefined;
        }
        const key = 'preview';
        const content = articleContentToHtml(response.article!.content, response.article!.title);
        await setToStorage(
          key,
          content,
        );
        await openPreview(key);
      }
    } catch (error) {
      console.error("Error in preview function:", error);
    }
  }

  async function manageArticles() {
    try {
      await openPage('articles.html');
    } catch (error) {
      console.error("Error in manageArticles function:", error);
    }
  }

  async function manageStorage() {
    try {
      await openPage('storage.html');
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

    document.getElementById("storageBtn")!.addEventListener("click", () => {
      manageStorage();
    });

    console.log('sending createAccountEvent');
    chrome.runtime.sendMessage({type: 'createAccount'});
  }

  document.addEventListener("DOMContentLoaded", setupListeners);

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
      if (details.previousVersion === "0.0.1") {
        chrome.runtime.sendMessage({type: 'toBase64'});
      }
    }
  });
})();
