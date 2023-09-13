import "./preview.css";
import { getArticles, getArticleContent } from "../../utils/storage";

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
const urlTitle = params.get('title');

getArticleContent(url as string).then((article) => {
  setIframeData(article);
});

getArticles().then((articles) => {
  const article = articles.get(url as string);
  const title: string  = article?.title || urlTitle || '';
  if(title !== null && title !== undefined) {
    const titleElement = document.querySelector("#title");
    titleElement!.innerHTML = title;
  }
});