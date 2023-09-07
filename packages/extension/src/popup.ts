'use strict';

import './popup.css';
import { Article, openPreview, storage } from './utils';

(function () {  
  async function collect() {
    console.log("collect");
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0].id) {
      const response: Article | undefined = await chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getHtml" },
      );
      console.log("response", response);
      if(response === undefined) {
        console.warn("failed to get article content");
        return undefined;
      }
      let src = `<html><head></head><body>${response!.content}</body></html>`;
      storage.set(src);
      await openPreview();
    }
  }

  function mint() {
    console.log("mint");
  }
  
  function setupListeners() {

    document.getElementById("collectBtn")!.addEventListener("click", () => {
      collect();
    });

    document.getElementById("mintBtn")!.addEventListener("click", () => {
      mint();
    });
  }
  
  document.addEventListener("DOMContentLoaded", setupListeners);
})();
