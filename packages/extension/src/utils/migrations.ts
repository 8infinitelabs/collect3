import { getArticleContent, getFromStorage, setToStorage } from "./storage";
import { encodeDocumentImages, isBase64 } from "./utils";
import Base64 from "./Base64";

type Articles = (string)[][];

export const fromHtmlToBase64 = async () => {
  const rawArticles = await getFromStorage('articles');
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
      await encodeDocumentImages(container);
      const content = container.innerHTML;
      const encodedContent = Base64.encode(content);
      await setToStorage(
        id,
        encodedContent
      );
    }
    console.timeEnd("fromHtmlToBase64");
  } catch (err) {
    console.log("err: ", err);
  }
};
