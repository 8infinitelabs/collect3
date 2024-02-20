import Base64 from "./Base64";
import {
  Metadata,
  Article,
  Storage,
  ACTIVE_STORAGE,
  DEFAULT_API,
  DEFAULT,
  STORAGE_OPTIONS,
} from "./utils";

export async function getFromStorage(key: string) : Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      resolve(result[key]);
    });
  });
}

export async function setToStorage(key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, function () {
      resolve(undefined);
    });
  });
}

export async function removeFromStorage(key: string) : Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, function () {
      resolve(undefined);
    });
  });
}

export async function getActiveStorage() : Promise<string> {
  let current = await getFromStorage(ACTIVE_STORAGE);
  if (!current) {
    const defaultStorage : Storage = {
      url: DEFAULT_API as string,
      alias: DEFAULT,
      deleted: false,
    };
    await setToStorage(
      ACTIVE_STORAGE,
      JSON.stringify(
        defaultStorage,
      ),
    );
    await setToStorage(
      STORAGE_OPTIONS,
      JSON.stringify(
        [defaultStorage],
      ),
    );
    return defaultStorage.url;
  }
  let activeStorage: Storage = JSON.parse(current);
  return activeStorage.url;
}

export async function getArticles(): Promise<Map<string, Metadata>> {
  const key = await getActiveStorage();
  let articles = await getFromStorage(key);
  if (!articles) {
    return new Map();
  } else {
    articles = new Map(JSON.parse(articles));
  }
  return articles;
}

export async function setArticles(url: string, data: Metadata, articles: Map<string, Metadata>) {
  const key = await getActiveStorage();
  if (!articles.has(url)) {
    articles.set(url, data);
    await setToStorage(
      key,
      JSON.stringify(
        Array.from(
          articles.entries(),
        ),
      ),
    );
  }
}

export async function removeArticles(url: string) : Promise<boolean> {
  const articles = await getArticles();
  const result = articles.delete(url);
  const key = await getActiveStorage();
  if (result) {
    await setToStorage(
      key,
      JSON.stringify(
        Array.from(
          articles.entries(),
        ),
      ),
    );
  }
  return result;
}

export async function getArticleContent(url: string) : Promise<string> {
  return getFromStorage(url);
}

export async function setArticleContent(url: string, content: string): Promise<void> {
  const exist = await getArticleContent(url);
  if(!exist) {
    await setToStorage(url, content);
  }
}

export async function deleteArticleContent(url: string) : Promise<void> {
  await removeFromStorage(url);
}

export async function saveArticle(url: string, article: Article) : Promise<void> {
  const articles = await getArticles();
  const { content, textContent, ...metadata } = article;
  const numOfWords = textContent.split(' ').length;
  // 255 is the word per minute constant
  const wpm = 255;
  metadata.length = Math.ceil( numOfWords / wpm );
  if (!articles.has(url)) {
    await setArticles(url, metadata as Metadata, articles);
    const content = article!.content;
    const encodedArticleContent = Base64.encode(content);
    await setArticleContent(
      url,
      encodedArticleContent,
    );
  }
}

export async function deleteArticle(url: string) : Promise<void> {
  await removeArticles(url);
  await deleteArticleContent(url);
}

export function listenToStorage(
  cb: (changes: {[key: string]: chrome.storage.StorageChange; }) => void,
  ) {
    chrome.storage.local.onChanged.addListener(cb)
}
