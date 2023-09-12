export interface Article {
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

export interface Metadata {
  title: string;
  length: number;
  excerpt: string; //description or extraction of the article
  byline: string; //author
  dir: string;
  siteName: string;
  lang: string;
}

export async function openPreview (path: string) : Promise<chrome.tabs.Tab> {
  let url = chrome.runtime.getURL('preview.html');
  url += `?url=${encodeURIComponent(path)}`
  return await chrome.tabs.create({ url, active: false, });
}