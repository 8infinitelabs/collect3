import { templateHtmlHead, templateHtmlMiddle, templateHtmlTail } from "./htmltemplate";

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
  length: number; //duration in minutes
  excerpt: string; //description or extraction of the article
  byline: string; //author
  dir: string;
  siteName: string;
  lang: string;
}

export async function openPreview(path: string): Promise<chrome.tabs.Tab> {
  let url = chrome.runtime.getURL('preview.html');
  url += `?url=${encodeURIComponent(path)}`
  return await chrome.tabs.create({ url, });
}
export async function openArticles(): Promise<chrome.tabs.Tab> {
  let url = chrome.runtime.getURL('articles.html');
  return await chrome.tabs.create({ url, });
}

export const toDataURL = async (url: string) => {
  return await fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
}

export const encodeDocumentImages = async (documentClone: Document | HTMLDivElement) => {
  console.time("encodeDocumentImages");
  const images = documentClone.querySelectorAll("img")
  for (let i = 0; i < images.length; i++) {
    const node = images[i];
    let src = node.src;
    if (src) {
      try {
        console.time("toDataUrlImage");
        const newUrl = await toDataURL(src);
        console.timeEnd("toDataUrlImage");
        node.src = newUrl as string;
        node.removeAttribute("srcset");
      } catch (err) {
        console.error("error: ", err);
      }
    }
  }
  console.log(`encoding ${images.length} images`);
  console.timeEnd("encodeDocumentImages");
};

export const isBase64 = (base64: string) => {
  let result = true;
  try {
    atob(base64);
  } catch (err) {
    result = false;
  }
  return result;
};

export function articleContentToHtml(content: string, title: string): string {
  const html = `
    ${templateHtmlHead}
      ${title}
    ${templateHtmlMiddle}
      ${content}
    ${templateHtmlTail}
  `;
  return html;
}
