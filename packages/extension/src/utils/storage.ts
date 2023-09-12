import { Metadata, Article } from "./utils";
export async function getFromStorage(key: string) : Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      resolve(result[key]);
    });
  });
}

export async function setToStorage(key: string, value: any) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, function () {
      resolve(undefined);
    });
  });
}

export async function getArticles(): Promise<Map<string, any>> {
  let articles = await getFromStorage('articles');
  if (!articles) {
    return new Map();
  } else {
    articles = new Map(JSON.parse(articles));
  }
  return articles;
}

export async function setArticles(url: string, data: Metadata, articles: Map<string, any>) {
  if (!articles.has(url)) {
    articles.set(url, data);
    await setToStorage(
      'articles',
      JSON.stringify(
        Array.from(
          articles.entries(),
        ),
      ),
    );
  }
}
export async function getArticleContent(url: string) {
  return getFromStorage(url);
}

export async function setArticleContent(url: string, content: string) {
  const exist = await getArticleContent(url);
  if(!exist) {
    await setToStorage(url, content);
  }
}

export async function saveArticle(url: string, article: Article) {
  const articles = await getArticles();
  const metadata: Metadata = { ...article };
  if (!articles.has(url)) {
    await setArticles(url, metadata, articles);
    await setArticleContent(
      url,
      `<html><head></head><body>${article!.content}</body></html>`,
    );
  }
}