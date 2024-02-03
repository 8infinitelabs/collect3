import "./preview.css";
import { getArticleContent, getArticles } from "../../utils/storage";
import { articleContentToHtml, isBase64 } from "../../utils/utils";
import Base64 from "../../utils/Base64";

function setIframeData(data: string) {
  console.time("setIframeData");
  const iframeContainer = document.querySelector("body > div > div")
  const iframe = document.createElement("iframe");
  iframe.id = "collected-content";

  console.time("creating html blob");
  const blob = new Blob(
    [data],
    {type: "text/html"}
  );
  console.timeEnd("creating html blob");

  iframe.src = window.URL.createObjectURL(blob);

  iframeContainer!.innerHTML = "";
  iframeContainer!.appendChild(iframe);
  console.timeEnd("setIframeData");
}

const params = new URLSearchParams(location.search);
const url = params.get('url');

console.time("getArticleContent")
Promise.all([
  getArticleContent(url as string),
  getArticles()
])
  .then(([article, ArticlesMetadata]) => {
  console.timeEnd("getArticleContent");
  const metadata = ArticlesMetadata.get(url as string);
  console.time("isBase64");
  let articleContent = article;
  if (isBase64(article)) {
    console.time("decoding");
    const decodedContent = Base64.decode(article);
    articleContent = articleContentToHtml(decodedContent, metadata?.title || "");
    console.timeEnd("decoding");
  }
  console.timeEnd("isBase64");
  console.log("article html length", articleContent.length);
  setIframeData(articleContent);
});
