import { getArticleContent, getFromStorage, setArticleContent } from "./storage";
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
      if (!isBase64(articleContent)) {
        continue;
      }
      const container = document.createElement('div');
      container.innerHTML = articleContent;
      await encodeDocumentImages(container);
      const content = container.innerHTML;
      await setArticleContent(
        id,
        Base64.encode(content)
      );
    }
  } catch (err) {
    console.log("err: ", err);
  }
};

export const testHtmlToBase64 = async () => {
  try {
    const id = "https://ilikekillnerds.com/2023/11/decoding-the-neural-dsp-plugin-preset-format/";
    const articleContent = await getArticleContent(id);
    console.log("articleContent", articleContent);
    console.log(Base64);
    if (isBase64(articleContent)) {
      console.log("Is Base64");
      return;
    }
    const container = document.createElement('div');
    container.innerHTML = articleContent;
    await encodeDocumentImages(container);
    const content = container.innerHTML;
    const encodedContent = Base64.encode(content);
    console.log("encodedContent", encodedContent);
    await setArticleContent(
      id,
      encodedContent,
    );
  } catch (err) {
    console.log("err: ", err);
  }
};
