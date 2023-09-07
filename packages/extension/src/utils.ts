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

//Window | null
export async function openPreview () : Promise<chrome.tabs.Tab> {
  const url = chrome.runtime.getURL('preview.html');
  return await chrome.tabs.create({ url, active: false, });
}

export const storage = {
  get: (cb: (article: string) => void) => {
    chrome.storage.local.get(["article"], (result) => {
      cb(result.article);
    });
  },
  set: (value: string, cb?: () => void) => {
    chrome.storage.local.set(
      {
        article: value,
      },
      () => {
        if (cb) cb();
      }
    );
  },
};
