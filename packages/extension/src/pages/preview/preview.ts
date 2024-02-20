import "./preview.css";
import { getArticleContent, getArticles } from "../../utils/storage";
import { articleContentToHtml, isBase64 } from "../../utils/utils";
import Base64 from "../../utils/Base64";

function setIframeData(data: string) {
  const iframeContainer = document.querySelector("body > div > div")
  const iframe = document.createElement("iframe");
  iframe.id = "collected-content";

  const blob = new Blob(
    [data],
    {type: "text/html"}
  );

  iframe.src = window.URL.createObjectURL(blob);

  iframeContainer!.innerHTML = "";
  iframeContainer!.appendChild(iframe);
}

const params = new URLSearchParams(location.search);
const url = params.get('url');

Promise.all([
  getArticleContent(url as string),
  getArticles()
])
  .then(([article, ArticlesMetadata]) => {
  const metadata = ArticlesMetadata.get(url as string);
  let articleContent = article;
  const articleIsBase64 = isBase64(article);
  if (articleIsBase64) {
    const decodedContent = Base64.decode(article);
    articleContent = articleContentToHtml(decodedContent, metadata?.title || "");
  }
  setIframeData(articleContent);
});
