'use strict';

import './popup.css';
import { openPreview } from './utils/utils';
import { saveArticle } from './utils/storage';

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
