import "./storage.css";
import { changeActiveStorage, createStorageOption, deleteStorageOption, getActiveStorage, getStorageOptions, listenToStorage } from "../../utils/storage";
import { ACTIVE_STORAGE, Storage, STORAGE_OPTIONS } from "../../utils/utils";

let activeStorage;
let reducedmotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
function storageToElement(option: Storage, isActive: boolean): HTMLLIElement {
  const element = `
    <div class="article-header">
      <h2>${option.alias}</h2>
    </div>
    <p>
      ${option.url}
    </p>
    <div>
      ${isActive ? "<span class=\"isActive\">isActive</span>" : ""}
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

const form: HTMLFormElement | null = document.querySelector("#create-storage-option")
if (form) {
  form.addEventListener('submit', async function(e: Event) {
    e.preventDefault()
    const aliasInput: HTMLInputElement | null = form[0] as HTMLInputElement;
    const urlInput: HTMLInputElement | null = form[1] as HTMLInputElement;
    const fileStorageType: HTMLSelectElement | null = form[2] as HTMLSelectElement;
    if (!aliasInput.value.trim()) {
      console.log("alias empty");
      return
    }
    let url: URL;
    try {
      url = new URL(urlInput.value)
    } catch (err) {
      console.log(err)
      return err;
    }

    const result = await createStorageOption(url.toString(), aliasInput.value.trim(), fileStorageType.value);
    console.log('result: ', result);
  })
}

const deleteStorage = async (id: string) => {
  const url = id.replace('-root', '');
  await deleteStorageOption(url);

};

let deleteButtonCallback: (e: Event) => Promise<void>;
if (reducedmotion) {
  deleteButtonCallback = async (e: Event) => {
    const target = e.target as Element;
    (target?.parentNode as Element).remove();
    await deleteStorage(target.id);
  }
} else {
  deleteButtonCallback = async (e: Event) => {
    const target = e.target as Element;
    (target?.parentNode as HTMLElement).style.transition = '1s';
    (target?.parentNode as Element).className = 'todelete';
    await deleteStorage(target.id);
  };
}

const makeMainCallback = (container: Element | null, url: string, storageType: string) => {
  return async () => {
    const activeNode = container?.querySelector('.isActive');
    activeNode?.remove();
    const node = container?.querySelector(`[id='${url}-root']`);
    const child = node?.querySelector(':nth-child(3)');
    const newChild = document.createElement('span');
    newChild.textContent = "isActive";
    newChild.className = "isActive";
    child?.appendChild(newChild);
    await changeActiveStorage(url, storageType, true);
  }
};

Promise.all([
  getActiveStorage(),
  getStorageOptions(),
]).then(([activeStorage, options]) => {
  const container = document.querySelector(".fullclick");
  const elements = options.map((option) => {
    if (option.deleted) {
      return null;
    }
    const element = storageToElement(
      option,
      option.url === activeStorage.url && option.storageType == activeStorage.storageType,
    );
    container?.appendChild(element);
    return element;
  });
  if (options.length) {
    if (!reducedmotion) {
      container?.addEventListener('transitionend', e => {
        const target = e.target as Element;
        if (target.classList.contains('todelete')) {
          target.remove();
        }
      });
    }
    elements.forEach((el, i) => {
      if (!el) {
        return el;
      }
      const makeMainButton = el.querySelector('.main');
      const deleteButton = el.querySelector('.delete-button');
      const option = options[i];

      deleteButton?.addEventListener('click', deleteButtonCallback);
      makeMainButton?.addEventListener('click', makeMainCallback(container, option.url, option.storageType));
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
        let deletedItem = false;
        oldValue.forEach((old) => {
          if (old.deleted) {
            newValue.forEach((recent) => {
              if (recent.url == old.url && !recent.deleted) {
                deletedItem = true;
              }
            })
          }
        });
        const shouldAddNode = (oldValue.length < newValue.length) || deletedItem;
        if (shouldAddNode) {
          newValue.forEach((value) => {
            const exist = oldValue.find((option) => {
              const isTheSame = option.url == value.url && option.storageType == value.storageType;
              if (!isTheSame) {
                return false;
              }
              if (option.deleted && !value.deleted) {
                return false;
              }
              return true;
            });
            if (!exist) {
              const el = storageToElement(
                value,
                false,
              );
              const makeMainButton = el.querySelector('.main');
              const deleteButton = el.querySelector('.delete-button');

              deleteButton?.addEventListener('click', deleteButtonCallback);
              makeMainButton?.addEventListener('click', makeMainCallback(container, value.url, value.storageType));
              container?.appendChild(el);
            }
          });
          return;
        }
        oldValue.forEach((value) => {
          const exist = newValue.find((option) => {
            return option.url == value.url;
          });
          if (!exist) {
            const oldElement = document.querySelector(`[id='${value.url}-root']`);
            oldElement?.remove();
          }
        });
      } else if (key == ACTIVE_STORAGE) {
        const newValue = JSON.parse(newRawValue) as Storage;
        const activeNode = container?.querySelector('.isActive');
        activeNode?.remove();
        const node = container?.querySelector(`[id='${newValue.url}-root']`);
        const child = node?.querySelector(':nth-child(3)');
        const newChild = document.createElement('span');
        newChild.textContent = "isActive";
        newChild.className = "isActive";
        child?.appendChild(newChild);
      }
    }
  });
});
