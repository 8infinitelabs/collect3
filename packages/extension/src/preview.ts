import "./preview.css";

function setIframeData(data: string) {
  const iframeContainer = document.querySelector("body > div > div")
  const iframe = document.createElement("iframe");
  iframe.id = "collected-content";
    
  const blob = new Blob(
    [data],
    {type: "text/html"}
  );
  console.log(data);
    
  iframe.src = window.URL.createObjectURL(blob);
    
  iframeContainer!.innerHTML = "";
  iframeContainer!.appendChild(iframe);
}

const params = new URLSearchParams(location.search);
const url = params.get('url');

chrome.storage.local.get([url], (result) => {
  console.log(url);
  setIframeData(result[`${url}`]);
});
