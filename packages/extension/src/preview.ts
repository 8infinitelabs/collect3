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

chrome.storage.local.get(["article"], (result) => {
  setIframeData(result.article);
});