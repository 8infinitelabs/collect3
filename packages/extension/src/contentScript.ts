'use strict';
import readability from '@mozilla/readability';
// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

interface Article {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
}

function getCleanedHtml(): Article | undefined {
  try {
    const documentClone = document.cloneNode(true) as Document;
    const article = new readability.Readability(documentClone).parse();

    return article || undefined;
  } catch (error) {
    console.warn('Error parsing document, sending original content');
    console.warn(error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let response;
  if (request.type === 'getHtml') {
    response = getCleanedHtml();
  }
  sendResponse(response);
});
