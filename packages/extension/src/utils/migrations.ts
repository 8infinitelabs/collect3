import { getArticleContent, getFromStorage, setToStorage } from "./storage";
import { encodeDocumentImages, isBase64 } from "./utils";
import Base64 from "./Base64";

type Articles = (string)[][];

const removeTemplateHtml = (content: HTMLDivElement) => {
  const mainContent = content.querySelector(".entry-content");
  return mainContent as HTMLDivElement;
};

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
