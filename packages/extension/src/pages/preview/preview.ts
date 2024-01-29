import "./preview.css";
import { getArticleContent } from "../../utils/storage";
import { isBase64 } from "../../utils/utils";
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

getArticleContent(url as string).then((article) => {
  let articleContent = article;
  if (isBase64(article)) {
    articleContent = Base64.decode(article);
  }
  setIframeData(articleContent);
});
