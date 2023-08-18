'use strict';

import './popup.css';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  // const counterStorage = {
  //   get: (cb: (count: number) => void) => {
  //     chrome.storage.sync.get(['count'], (result) => {
  //       cb(result.count);
  //     });
  //   },
  //   set: (value: number, cb: () => void) => {
  //     chrome.storage.sync.set(
  //       {
  //         count: value,
  //       },
  //       () => {
  //         cb();
  //       }
  //     );
  //   },
  // };

  
  async function collect() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0].id) {
      const response = await chrome.tabs.sendMessage(
        tabs[0].id,
        { type: 'getHtml' },
      );
      console.log('response', response);
      if(response === undefined) {
        console.warn('failed to get article content')
      }
    }
  }

  function mint() {
    console.log('mint');
  }
  
  function setupListeners() {

    document.getElementById('collectBtn')!.addEventListener('click', () => {
      collect();
    });

    document.getElementById('mintBtn')!.addEventListener('click', () => {
      mint();
    });
  }
  
  document.addEventListener('DOMContentLoaded', setupListeners);
})();
