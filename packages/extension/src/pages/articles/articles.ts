import "./articles.css";
import { getArticles } from "../../utils/storage";
import { Metadata } from "../../utils/utils";

function articleToElement(key: string, article : Metadata) : HTMLAnchorElement {
  const element = `
    <div class="article-header">
      <h2>${article.title}</h2> ${article.byline? `<span>by: ${article.byline}</span>` : ''}
    </div>
    <p>
      ${article.excerpt}
    </p>
    <span>${article.lang}</span>
  `;
  const root = document.createElement("a");
  root.className = "article";
  root.innerHTML = element;
  root.target = "_blank";
  root.href = `${chrome.runtime.getURL('preview.html')}?url=${encodeURIComponent(key)}`
  return root;
}

getArticles().then((articles) => {
  const container = document.querySelector(".container");
  console.log(container);
  const articlesArray = Array.from(articles.entries());
  articlesArray.forEach(([key, metadata]) => {
    container?.appendChild(articleToElement(key, metadata));
  })
});