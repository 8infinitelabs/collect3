import {
  getActiveStorage,
  getArticleContent,
  getFromStorage,
  removeFromStorage,
  setToStorage,
} from "./storage";
import { encodeDocumentImages, isBase64 } from "./utils";
import Base64 from "./Base64";

type Articles = (string)[][];

const removeTemplateHtml = (content: HTMLDivElement) => {
  const mainContent = content.querySelector(".entry-content");
  return mainContent as HTMLDivElement;
};

export const fromLocalOnlyToMultipleRemotes = async () => {
  const key = await getActiveStorage();
  const rawArticles = await getFromStorage('articles');
  await setToStorage(key, rawArticles);
  await removeFromStorage('articles');
}

export const fromHtmlToBase64 = async () => {
  const key = await getActiveStorage();
  const rawArticles = await getFromStorage(key);
  try {
    const articles: Articles = JSON.parse(rawArticles);
    for (let i = 0; i < articles.length; i++) {
      const [id] = articles[i];
      const articleContent = await getArticleContent(id);
      if (isBase64(articleContent)) {
        continue;
      }
      const container = document.createElement('div');
      container.innerHTML = articleContent;
      const contentNode = removeTemplateHtml(container);
      await encodeDocumentImages(contentNode);
      const content = contentNode.innerHTML;
      const encodedContent = Base64.encode(content);
      await setToStorage(
        id,
        encodedContent
      );
    }
  } catch (err) {
    console.log("err: ", err);
  }
};

