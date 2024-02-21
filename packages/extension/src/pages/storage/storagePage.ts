import "./storage.css";
import { getActiveStorage, getStorageOptions, listenToStorage } from "../../utils/storage";
import { Storage, STORAGE_OPTIONS } from "../../utils/utils";

let activeStorage;
function storageToElement(option : Storage, isActive: boolean) : HTMLLIElement {
  const element = `
    <div class="article-header">
      <h2>${option.alias}</h2>
    </div>
    <p>
      ${option.url}
    </p>
    <div>
      <span>in ${option.deleted}</span>
      <span>isActive ${isActive}</span>
    </div>
    <button
      title="click to make active"
      aria-label="click to make active"
      id="${option.url}--makeActive"
      class="main"
    >
      Make Main Storage Option
    </button>
    <button
      id="${option.url}"
      class="delete-button"
      title="click to delete"
      aria-label="click to delete"
    >
      x
    </button>
  `;
  const root = document.createElement("li");
  root.innerHTML = element;
  root.id = option.url + '-root';
  if (isActive) {
    activeStorage = root;
  }
  return root;
}

function noElementMessage(container: Element) {
  const element = '<h1 class="text-center">No Storage Option Available</h1>';
  const root = document.createElement("li");
  root.id = "no-element";
  root.innerHTML = element;
  container.appendChild(root);
}

Promise.all([
  getActiveStorage(),
  getStorageOptions(),
]).then(([activeStorage, options]) => {
  const container = document.querySelector(".fullclick");
  const elements = options.map((option) => {
    const element = storageToElement(
      option,
      option.url === activeStorage.url,
    );
    container?.appendChild(element);
    return element;
  });
  if (options.length) {
    let callback: (e: Event) => void;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      callback = (e: Event) => {
        const target = e.target as Element;
        (target?.parentNode as Element).remove();
          //deleteArticle(target.id);
      }
      //container?.addEventListener('click',       });
    } else {
      callback = (e: Event) => {
        const target = e.target as Element;
        (target?.parentNode as HTMLElement).style.transition = '1s';
        (target?.parentNode as Element).className = 'todelete';
          //deleteArticle(target.id);
      };
      //container?.addEventListener('click', e => { });
      container?.addEventListener('transitionend', e => {
        const target = e.target as Element;
        if (target.classList.contains('todelete')) {
          target.remove();
        }
      });
    }
    elements.forEach((el, i) => {
      const makeMainButton = el.querySelector('.main');
      const deleteButton = el.querySelector('.delete-button');
      const option = options[i];

      deleteButton?.addEventListener('click', callback);
      makeMainButton?.addEventListener('click', () => console.log('new main ', option.url));
    });
  } else {
    if (container) noElementMessage(container);
  }
  listenToStorage((changes) => {
    for (let [key, { oldValue: oldRawValue, newValue: newRawValue }] of Object.entries(changes)) {
      if (key == STORAGE_OPTIONS) {
        const oldValue = JSON.parse(oldRawValue) as Storage[];
        const newValue = JSON.parse(newRawValue) as Storage[];
        if (oldValue.length == 0) {
          const oldElement = container?.querySelector("#no-element");
          oldElement?.remove();
          return;
        }
        if (newValue.length == 0) {
          container!.innerHTML = "";
          noElementMessage(container as Element);
          return;
        }
        if (oldValue.length < newValue.length) {
          newValue.forEach((value) => {
            const exist = oldValue.find((option) => {
              return option.url == value.url;
            });
            if (!exist) {
              container?.appendChild(
                storageToElement(
                  value,
                  false,
                ),
              );
            }
          });
          return;
        }
        oldValue.forEach((value) => {
          const exist = newValue.find((option) => {
              return option.url == value.url;
            });
          if (!exist) {
            const oldElement = document.querySelector(`#${value.url}-root`);
            oldElement?.remove();
          }
        });
      }

    }
  });

});
