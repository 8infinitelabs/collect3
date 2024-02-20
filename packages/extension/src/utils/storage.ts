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
async function initializeStorage() {
  const defaultStorage : Storage = {
    url: DEFAULT_API as string,
    alias: DEFAULT,
    deleted: false,
    shouldSync: false,
  };
  await setToStorage(
    ACTIVE_STORAGE,
    JSON.stringify(
      defaultStorage,
    ),
  );
  delete defaultStorage.shouldSync;
  await setToStorage(
    STORAGE_OPTIONS,
    JSON.stringify(
      [defaultStorage],
    ),
  );
}

export async function getActiveStorage() : Promise<Storage> {
  let current = await getFromStorage(ACTIVE_STORAGE);
  if (!current) {
    await initializeStorage();
    return {
      url: DEFAULT_API as string,
      alias: DEFAULT,
      deleted: false,
      shouldSync: false,
    };
  }
  let activeStorage: Storage = JSON.parse(current);
  return activeStorage;
}

export async function getStorageOptions() : Promise<Storage[]> {
  let rawOptions = await getFromStorage(STORAGE_OPTIONS);
  if (!rawOptions) {
    await initializeStorage();
    rawOptions = await getFromStorage(STORAGE_OPTIONS);
  }
  const options: Storage[] = JSON.parse(rawOptions);
  return options;
}

export async function createStorageOption(url: string, alias: string) : Promise<boolean> {
  const options = await getStorageOptions();
  const exist = options.find((s) => {
    const optionUrl = new URL(s.url);
    const newUrl = new URL(url);
      return optionUrl.host == newUrl.host && optionUrl.pathname == newUrl.pathname;
  });
  const newStorage : Storage = {
    url,
    alias,
    deleted: false,
  };
  if (exist) {
    return false;
  }
  options.push(newStorage);
  await setToStorage(
    STORAGE_OPTIONS,
    JSON.stringify(
      options,
    ),
  );
  return true;
}

export async function changeActiveStorage(url: string) : Promise<void> {
  const options = await getStorageOptions();
  const exist = options.find((s) => {
    const optionUrl = new URL(s.url);
    const newUrl = new URL(url);
      return optionUrl.host == newUrl.host && optionUrl.pathname == newUrl.pathname;
  });

  if (!exist) {
    return;
  }

  exist.shouldSync = false;
  await setToStorage(
    ACTIVE_STORAGE,
    JSON.stringify(
      exist,
    ),
  );
}

export async function getArticles(): Promise<Map<string, Metadata>> {
  const key = await getActiveStorage();
  let articles = await getFromStorage(key.url);
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
      key.url,
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
      key.url,
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
