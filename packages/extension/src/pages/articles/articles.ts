import "./articles.css";
import { getArticles, deleteArticle, listenToStorage } from "../../utils/storage";
import { Metadata } from "../../utils/utils";

function articleToElement(key: string, article : Metadata) : HTMLLIElement {
  const element = `
    <div class="article-header">
      <h2>${article.title}</h2> ${article.byline? `<span>by: ${article.byline}</span>` : ''}
    </div>
    <p>
      ${article.excerpt}
    </p>
    <a href="${chrome.runtime.getURL('preview.html')}?url=${encodeURIComponent(key)}" target="_blank" class="main">Read Article</a>
    <span>${article.lang}</span>
    <button id="${key}" title="click to close" aria-label="click to close">x</button>
  `;
  const root = document.createElement("li");
  root.innerHTML = element;
  root.id = key + '-root';
  console.log('element key', root.id);
  return root;
}

function noElementMessage(container: Element) {
  const element = '<h1 class="text-center">No Articles To Display</h1>';
  const root = document.createElement("li");
  root.id = "no-element";
  root.innerHTML = element;
  container.appendChild(root);
}

getArticles().then((articles) => {
  const container = document.querySelector(".fullclick");
  const articlesArray = Array.from(articles.entries());
  articlesArray.forEach(([key, metadata]) => {
    container?.appendChild(articleToElement(key, metadata));
  });
  if (articlesArray.length) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      container?.addEventListener('click', e => {
        const target = e.target as Element;
        if (target.nodeName === 'BUTTON') {
          (target?.parentNode as Element).remove();
          deleteArticle(target.id);
        }
      });
    } else {
      container?.addEventListener('click', e => {
        const target = e.target as Element;
        if (target.nodeName === 'BUTTON') {
          (target?.parentNode as HTMLElement).style.transition = '1s';
          (target?.parentNode as Element).className = 'todelete';
          deleteArticle(target.id);
        }
      });
      container?.addEventListener('transitionend', e => {
        const target = e.target as Element;
        if (target.classList.contains('todelete')) {
          target.remove();
        }
      });
    }
  } else {
    if (container) noElementMessage(container);
  }
  listenToStorage((changes) => {
    for (let [key, { oldValue: oldRawValue, newValue: newRawValue }] of Object.entries(changes)) {
      if (key == "articles") {
        const oldValue = new Map(JSON.parse(oldRawValue)) as Map<string, Metadata>;
        const newValue = new Map(JSON.parse(newRawValue)) as Map<string, Metadata>;
        console.log('oldvalue size', oldValue.size);
        console.log('newValue size', newValue.size);
        if (oldValue.size == 0) {
          const oldElement = container?.querySelector("#no-element");
          oldElement?.remove();
        } 
        if (newValue.size == 0) {
          container!.innerHTML = "";
          noElementMessage(container as Element);
        } else if(oldValue.size < newValue.size){
          newValue.forEach((value, key) => {
            if (!oldValue.has(key)) {
              container?.appendChild(articleToElement(key, value));
            }
          });
        } else {
          console.log('should delete an article');
          oldValue.forEach((value, key) => {
            console.log(value.title);
            if (!newValue.has(key)) {
              console.log('newValue does not have key');
              const oldElement = document.querySelector(`#${key}-root`);
              console.log(oldElement);
              oldElement?.remove();
            } else {
              console.log('newValue has key');
            }
          });
        }
      }
    }
  });
  
});