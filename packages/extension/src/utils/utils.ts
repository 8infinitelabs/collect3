export interface Article {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
}

export interface Metadata {
  title: string;
  length: number; //duration in minutes
  excerpt: string; //description or extraction of the article
  byline: string; //author
  dir: string;
  siteName: string;
  lang: string;
}

export async function openPreview(path: string): Promise<chrome.tabs.Tab> {
  let url = chrome.runtime.getURL('preview.html');
  url += `?url=${encodeURIComponent(path)}`
  return await chrome.tabs.create({ url, });
}
export async function openArticles(): Promise<chrome.tabs.Tab> {
  let url = chrome.runtime.getURL('articles.html');
  return await chrome.tabs.create({ url, });
}

export const toDataURL = async (url: string) => {
  return await fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
}

export const encodeDocumentImages = async (documentClone: Document | HTMLDivElement) => {
  console.time("encodeDocumentImages");
  const images = documentClone.querySelectorAll("img")
  for (let i = 0; i < images.length; i++) {
    const node = images[i];
    let src = node.src;
    if (src) {
      try {
        console.time("toDataUrlImage");
        const newUrl = await toDataURL(src);
        console.timeEnd("toDataUrlImage");
        node.src = newUrl as string;
        node.srcset = "";
      } catch (err) {
        console.error("error: ", err);
      }
    }
  }
  console.log(`encoding ${images.length} images`);
  console.timeEnd("encodeDocumentImages");
};

export const isBase64 = (base64: string) => {
  let result = true;
  try {
    atob(base64);
  } catch (err) {
    result = false;
  }
  return result;
};

export function articleContentToHtml(content: string, title: string): string {
  const html = `
    <html>
      <head>
      <base id="content_base" target="_top">
      <style id="content_document_common_stylesheet">:root {
        --sepia-color:#F9F5E9;
        --sepia_default-link-color:#0072C9;
        --sepia_active-link-color:#097DD5;
        --light-color:#FCFCFC;
        --light_default-link-color:#0075CF;
        --light_active-link-color:#0D7FD6;
        --light-yellow-color:#eceb8b;
        --light-yellow_default-link-color:#0069B9;
        --light-yellow_active-link-color:#0075CF;
        --lime-color:#b8d686;
        --lime_default-link-color:#005699;
        --lime_active-link-color:#0063AE;
        --light-green-color:#a5da90;
        --light-green_default-link-color:#005699;
        --light-green_active-link-color:#0063AE;
        --light-teal-color:#94e2be;
        --light-teal_default-link-color:#005CA3;
        --light-teal_active-link-color:#0069B9;
        --turquoise-color:#89e1dd;
        --turquoise_default-link-color:#005CA3;
        --turquoise_active-link-color:#0069B9;
        --teal-color:#8ed5de;
        --teal_default-link-color:#005699;
        --teal_active-link-color:#0063AE;
        --sky-blue-color:#a3cfe4;
        --sky-blue_default-link-color:#005699;
        --sky-blue_active-link-color:#0063AE;
        --light-blue-color:#b3caec;
        --light-blue_default-link-color:#005699;
        --light-blue_active-link-color:#0063AE;
        --lavender-color:#d1bfeb;
        --lavender_default-link-color:#005393;
        --lavender_active-link-color:#0060A9;
        --orchid-color:#edb5f3;
        --orchid_default-link-color:#005393;
        --orchid_active-link-color:#0060A9;
        --grey-color:#E6E6E6;
        --grey_default-link-color:#0069B9;
        --grey_active-link-color:#0075CF;
        --pink-color:#f6b6d9;
        --pink_default-link-color:#005699;
        --pink_active-link-color:#0063AE;
        --carnation-color:#fdacc3;
        --carnation_default-link-color:#00508E;
        --carnation_active-link-color:#005CA3;
        --dark-grey-color:#242424;
        --dark-grey_default-link-color:#3091DC;
        --dark-grey_active-link-color:#1E88D9;
        --black-color:#000000;
        --black_default-link-color:#0078D4;
        --black_active-link-color:#006CBE;
        --green-color:#91ffa6;
        --green_default-link-color:#0069B9;
        --green_active-link-color:#0075CF;
        --blue-color:#87faff;
        --blue_default-link-color:#0069B9;
        --blue_active-link-color:#0075CF;
        --yellow-color:#feff5c;
        --yellow_default-link-color:#0072C9;
        --yellow_active-link-color:#097DD5;
        --rose-color:#febaba;
        --rose_default-link-color:#005699;
        --rose_active-link-color:#0063AE;
        --apricot-color:#f1bfa9;
        --apricot_default-link-color:#005699;
        --apricot_active-link-color:#0063AE;
        --light-orange-color:#f0d592;
        --light-orange_default-link-color:#0060A9;
        --light-orange_active-link-color:#006CBE;
        }

        .ms-fontsize-extraextrasmall {
          font-size: 82%;
        }
        .ms-fontsize-extrasmall {
          font-size: 91%;
        }
        .ms-fontsize-small {
          font-size: 100%;
        }
        .ms-fontsize-medium {
          font-size: 114%;
        }
        .ms-fontsize-large {
          font-size: 136%;
        }
        .ms-fontsize-extralarge {
          font-size: 182%;
        }
        .ms-fontsize-extraextralarge {
          font-size: 341%;
        }
        .ms-theme-sepia body {
          background: var(--sepia-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-sepia .contentBody {
          color: #333333 !important;
        }
        .ms-theme-sepia .__reading_mode_infobox_and_collapse_button_container, .ms-theme-sepia .__reading_mode_table_and_collapse_button_container, .ms-theme-sepia th, .ms-theme-sepia td, .ms-theme-sepia caption {
          border-color: #E6E1CF !important;
        }
        .ms-theme-sepia .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #E6E1CF;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-sepia .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-sepia .__reading_mode_data_table_class thead {
          background-color: #E6E1CF;
        }
        .ms-theme-sepia .__reading_mode_data_table_class thead th, .ms-theme-sepia .__reading_mode_data_table_class thead td {
          border-color: var(--sepia-color,#F9F5E9) !important;
        }
        .ms-theme-sepia #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-sepia .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-sepia .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-sepia .__reading__mode__feedback__button:hover {
          background: #E6E1CF;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-sepia .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-sepia .__reading__mode__feedback__separator {
          border-top: 1px solid #E6E1CF;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-sepia .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-sepia div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-sepia div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-sepia a {
          color: var(--sepia_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-sepia a:visited {
          color: var(--sepia_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-sepia a:hover {
          color: var(--sepia_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-sepia a:active {
          color: var(--sepia_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-light body {
          background: var(--light-color,#FCFCFC);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-light .contentBody {
          color: #333333 !important;
        }
        .ms-theme-light .__reading_mode_infobox_and_collapse_button_container, .ms-theme-light .__reading_mode_table_and_collapse_button_container, .ms-theme-light th, .ms-theme-light td, .ms-theme-light caption {
          border-color: #ECECEC !important;
        }
        .ms-theme-light .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #ECECEC;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-light .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-light .__reading_mode_data_table_class thead {
          background-color: #ECECEC;
        }
        .ms-theme-light .__reading_mode_data_table_class thead th, .ms-theme-light .__reading_mode_data_table_class thead td {
          border-color: var(--light-color,#FCFCFC) !important;
        }
        .ms-theme-light #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-light .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-light .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-light .__reading__mode__feedback__button:hover {
          background: #ECECEC;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-light .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-light .__reading__mode__feedback__separator {
          border-top: 1px solid #ECECEC;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-light .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-light div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-light div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-light a {
          color: var(--light_default-link-color,#0075CF) !important;
          text-decoration: none !important;
        }
        .ms-theme-light a:visited {
          color: var(--light_default-link-color,#0075CF) !important;
          text-decoration: none !important;
        }
        .ms-theme-light a:hover {
          color: var(--light_default-link-color,#0075CF) !important;
          text-decoration: underline !important;
        }
        .ms-theme-light a:active {
          color: var(--light_active-link-color,#0D7FD6) !important;
          text-decoration: underline !important;
        }
        .ms-theme-grey body {
          background: var(--grey-color,#E6E6E6);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-grey .contentBody {
          color: #333333 !important;
        }
        .ms-theme-grey .__reading_mode_infobox_and_collapse_button_container, .ms-theme-grey .__reading_mode_table_and_collapse_button_container, .ms-theme-grey th, .ms-theme-grey td, .ms-theme-grey caption {
          border-color: #C8C7C7 !important;
        }
        .ms-theme-grey .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #C8C7C7;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-grey .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-grey .__reading_mode_data_table_class thead {
          background-color: #C8C7C7;
        }
        .ms-theme-grey .__reading_mode_data_table_class thead th, .ms-theme-grey .__reading_mode_data_table_class thead td {
          border-color: var(--grey-color,#E6E6E6) !important;
        }
        .ms-theme-grey #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-grey .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-grey .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-grey .__reading__mode__feedback__button:hover {
          background: #C8C7C7;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-grey .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-grey .__reading__mode__feedback__separator {
          border-top: 1px solid #C8C7C7;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-grey .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-grey div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-grey div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-grey a {
          color: var(--grey_default-link-color,#0069B9) !important;
          text-decoration: none !important;
        }
        .ms-theme-grey a:visited {
          color: var(--grey_default-link-color,#0069B9) !important;
          text-decoration: none !important;
        }
        .ms-theme-grey a:hover {
          color: var(--grey_default-link-color,#0069B9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-grey a:active {
          color: var(--grey_active-link-color,#0075CF) !important;
          text-decoration: underline !important;
        }
        .ms-theme-black body {
          background: var(--black-color,#000000);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-black .contentBody {
          color: #EDEDED !important;
        }
        .ms-theme-black .__reading_mode_infobox_and_collapse_button_container, .ms-theme-black .__reading_mode_table_and_collapse_button_container, .ms-theme-black th, .ms-theme-black td, .ms-theme-black caption {
          border-color: #404040 !important;
        }
        .ms-theme-black .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #404040;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-black .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-black .__reading_mode_data_table_class thead {
          background-color: #404040;
        }
        .ms-theme-black .__reading_mode_data_table_class thead th, .ms-theme-black .__reading_mode_data_table_class thead td {
          border-color: var(--black-color,#000000) !important;
        }
        .ms-theme-black #__reading__mode__sendfeedback {
          color: #EDEDED !important;
        }
        .ms-theme-black .__reading__mode__feedback__button path {
          fill: #EDEDED !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-black .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-black .__reading__mode__feedback__button:hover {
          background: #404040;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-black .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-black .__reading__mode__feedback__separator {
          border-top: 1px solid #404040;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-black .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-black div::-webkit-scrollbar-thumb {
          background: #7D7D7D;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-black div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-black a {
          color: var(--black_default-link-color,#0078D4) !important;
          text-decoration: none !important;
        }
        .ms-theme-black a:visited {
          color: var(--black_default-link-color,#0078D4) !important;
          text-decoration: none !important;
        }
        .ms-theme-black a:hover {
          color: var(--black_default-link-color,#0078D4) !important;
          text-decoration: underline !important;
        }
        .ms-theme-black a:active {
          color: var(--black_active-link-color,#006CBE) !important;
          text-decoration: underline !important;
        }
        .ms-theme-black .progress_pages_pending {
          color: #FFFFFF !important;
        }
        .ms-theme-black #source {
          text-decoration: none !important;
        }
        .ms-theme-black #source:hover {
          text-decoration: underline !important;
        }
        .ms-theme-green body {
          background: var(--green-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-green .contentBody {
          color: #333333 !important;
        }
        .ms-theme-green .__reading_mode_infobox_and_collapse_button_container, .ms-theme-green .__reading_mode_table_and_collapse_button_container, .ms-theme-green th, .ms-theme-green td, .ms-theme-green caption {
          border-color: #78ED8F !important;
        }
        .ms-theme-green .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #78ED8F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-green .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-green .__reading_mode_data_table_class thead {
          background-color: #78ED8F;
        }
        .ms-theme-green .__reading_mode_data_table_class thead th, .ms-theme-green .__reading_mode_data_table_class thead td {
          border-color: var(--green-color,#F9F5E9) !important;
        }
        .ms-theme-green #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-green .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-green .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-green .__reading__mode__feedback__button:hover {
          background: #78ED8F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-green .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-green .__reading__mode__feedback__separator {
          border-top: 1px solid #78ED8F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-green .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-green div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-green div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-green a {
          color: var(--green_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-green a:visited {
          color: var(--green_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-green a:hover {
          color: var(--green_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-green a:active {
          color: var(--green_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-blue body {
          background: var(--blue-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-blue .contentBody {
          color: #333333 !important;
        }
        .ms-theme-blue .__reading_mode_infobox_and_collapse_button_container, .ms-theme-blue .__reading_mode_table_and_collapse_button_container, .ms-theme-blue th, .ms-theme-blue td, .ms-theme-blue caption {
          border-color: #68E6EB !important;
        }
        .ms-theme-blue .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #68E6EB;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-blue .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-blue .__reading_mode_data_table_class thead {
          background-color: #68E6EB;
        }
        .ms-theme-blue .__reading_mode_data_table_class thead th, .ms-theme-blue .__reading_mode_data_table_class thead td {
          border-color: var(--blue-color,#F9F5E9) !important;
        }
        .ms-theme-blue #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-blue .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-blue .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-blue .__reading__mode__feedback__button:hover {
          background: #68E6EB;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-blue .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-blue .__reading__mode__feedback__separator {
          border-top: 1px solid #68E6EB;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-blue .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-blue div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-blue div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-blue a {
          color: var(--blue_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-blue a:visited {
          color: var(--blue_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-blue a:hover {
          color: var(--blue_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-blue a:active {
          color: var(--blue_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-yellow body {
          background: var(--yellow-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-yellow .contentBody {
          color: #333333 !important;
        }
        .ms-theme-yellow .__reading_mode_infobox_and_collapse_button_container, .ms-theme-yellow .__reading_mode_table_and_collapse_button_container, .ms-theme-yellow th, .ms-theme-yellow td, .ms-theme-yellow caption {
          border-color: #F1EF5F !important;
        }
        .ms-theme-yellow .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #F1EF5F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-yellow .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-yellow .__reading_mode_data_table_class thead {
          background-color: #F1EF5F;
        }
        .ms-theme-yellow .__reading_mode_data_table_class thead th, .ms-theme-yellow .__reading_mode_data_table_class thead td {
          border-color: var(--yellow-color,#F9F5E9) !important;
        }
        .ms-theme-yellow #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-yellow .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-yellow .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-yellow .__reading__mode__feedback__button:hover {
          background: #F1EF5F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-yellow .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-yellow .__reading__mode__feedback__separator {
          border-top: 1px solid #F1EF5F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-yellow .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-yellow div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-yellow div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-yellow a {
          color: var(--yellow_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-yellow a:visited {
          color: var(--yellow_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-yellow a:hover {
          color: var(--yellow_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-yellow a:active {
          color: var(--yellow_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-rose body {
          background: var(--rose-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-rose .contentBody {
          color: #333333 !important;
        }
        .ms-theme-rose .__reading_mode_infobox_and_collapse_button_container, .ms-theme-rose .__reading_mode_table_and_collapse_button_container, .ms-theme-rose th, .ms-theme-rose td, .ms-theme-rose caption {
          border-color: #F89F9F !important;
        }
        .ms-theme-rose .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #F89F9F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-rose .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-rose .__reading_mode_data_table_class thead {
          background-color: #F89F9F;
        }
        .ms-theme-rose .__reading_mode_data_table_class thead th, .ms-theme-rose .__reading_mode_data_table_class thead td {
          border-color: var(--rose-color,#F9F5E9) !important;
        }
        .ms-theme-rose #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-rose .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-rose .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-rose .__reading__mode__feedback__button:hover {
          background: #F89F9F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-rose .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-rose .__reading__mode__feedback__separator {
          border-top: 1px solid #F89F9F;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-rose .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-rose div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-rose div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-rose a {
          color: var(--rose_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-rose a:visited {
          color: var(--rose_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-rose a:hover {
          color: var(--rose_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-rose a:active {
          color: var(--rose_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-apricot body {
          background: var(--apricot-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-apricot .contentBody {
          color: #333333 !important;
        }
        .ms-theme-apricot .__reading_mode_infobox_and_collapse_button_container, .ms-theme-apricot .__reading_mode_table_and_collapse_button_container, .ms-theme-apricot th, .ms-theme-apricot td, .ms-theme-apricot caption {
          border-color: #ECA788 !important;
        }
        .ms-theme-apricot .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #ECA788;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-apricot .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-apricot .__reading_mode_data_table_class thead {
          background-color: #ECA788;
        }
        .ms-theme-apricot .__reading_mode_data_table_class thead th, .ms-theme-apricot .__reading_mode_data_table_class thead td {
          border-color: var(--apricot-color,#F9F5E9) !important;
        }
        .ms-theme-apricot #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-apricot .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-apricot .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-apricot .__reading__mode__feedback__button:hover {
          background: #ECA788;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-apricot .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-apricot .__reading__mode__feedback__separator {
          border-top: 1px solid #ECA788;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-apricot .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-apricot div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-apricot div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-apricot a {
          color: var(--apricot_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-apricot a:visited {
          color: var(--apricot_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-apricot a:hover {
          color: var(--apricot_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-apricot a:active {
          color: var(--apricot_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightorange body {
          background: var(--light-orange-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-lightorange .contentBody {
          color: #333333 !important;
        }
        .ms-theme-lightorange .__reading_mode_infobox_and_collapse_button_container, .ms-theme-lightorange .__reading_mode_table_and_collapse_button_container, .ms-theme-lightorange th, .ms-theme-lightorange td, .ms-theme-lightorange caption {
          border-color: #E4C066 !important;
        }
        .ms-theme-lightorange .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #E4C066;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightorange .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-lightorange .__reading_mode_data_table_class thead {
          background-color: #E4C066;
        }
        .ms-theme-lightorange .__reading_mode_data_table_class thead th, .ms-theme-lightorange .__reading_mode_data_table_class thead td {
          border-color: var(--light-orange-color,#F9F5E9) !important;
        }
        .ms-theme-lightorange #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-lightorange .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightorange .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-lightorange .__reading__mode__feedback__button:hover {
          background: #E4C066;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightorange .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-lightorange .__reading__mode__feedback__separator {
          border-top: 1px solid #E4C066;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightorange .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-lightorange div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightorange div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-lightorange a {
          color: var(--light-orange_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightorange a:visited {
          color: var(--light-orange_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightorange a:hover {
          color: var(--light-orange_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightorange a:active {
          color: var(--light-orange_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightyellow body {
          background: var(--light-yellow-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-lightyellow .contentBody {
          color: #333333 !important;
        }
        .ms-theme-lightyellow .__reading_mode_infobox_and_collapse_button_container, .ms-theme-lightyellow .__reading_mode_table_and_collapse_button_container, .ms-theme-lightyellow th, .ms-theme-lightyellow td, .ms-theme-lightyellow caption {
          border-color: #E0DE6E !important;
        }
        .ms-theme-lightyellow .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #E0DE6E;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightyellow .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-lightyellow .__reading_mode_data_table_class thead {
          background-color: #E0DE6E;
        }
        .ms-theme-lightyellow .__reading_mode_data_table_class thead th, .ms-theme-lightyellow .__reading_mode_data_table_class thead td {
          border-color: var(--light-yellow-color,#F9F5E9) !important;
        }
        .ms-theme-lightyellow #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-lightyellow .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightyellow .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-lightyellow .__reading__mode__feedback__button:hover {
          background: #E0DE6E;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightyellow .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-lightyellow .__reading__mode__feedback__separator {
          border-top: 1px solid #E0DE6E;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightyellow .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-lightyellow div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightyellow div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-lightyellow a {
          color: var(--light-yellow_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightyellow a:visited {
          color: var(--light-yellow_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightyellow a:hover {
          color: var(--light-yellow_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightyellow a:active {
          color: var(--light-yellow_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lime body {
          background: var(--lime-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-lime .contentBody {
          color: #333333 !important;
        }
        .ms-theme-lime .__reading_mode_infobox_and_collapse_button_container, .ms-theme-lime .__reading_mode_table_and_collapse_button_container, .ms-theme-lime th, .ms-theme-lime td, .ms-theme-lime caption {
          border-color: #A8C775 !important;
        }
        .ms-theme-lime .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #A8C775;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lime .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-lime .__reading_mode_data_table_class thead {
          background-color: #A8C775;
        }
        .ms-theme-lime .__reading_mode_data_table_class thead th, .ms-theme-lime .__reading_mode_data_table_class thead td {
          border-color: var(--lime-color,#F9F5E9) !important;
        }
        .ms-theme-lime #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-lime .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lime .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-lime .__reading__mode__feedback__button:hover {
          background: #A8C775;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lime .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-lime .__reading__mode__feedback__separator {
          border-top: 1px solid #A8C775;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lime .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-lime div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lime div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-lime a {
          color: var(--lime_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lime a:visited {
          color: var(--lime_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lime a:hover {
          color: var(--lime_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lime a:active {
          color: var(--lime_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightgreen body {
          background: var(--light-green-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-lightgreen .contentBody {
          color: #333333 !important;
        }
        .ms-theme-lightgreen .__reading_mode_infobox_and_collapse_button_container, .ms-theme-lightgreen .__reading_mode_table_and_collapse_button_container, .ms-theme-lightgreen th, .ms-theme-lightgreen td, .ms-theme-lightgreen caption {
          border-color: #94CF7D !important;
        }
        .ms-theme-lightgreen .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #94CF7D;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightgreen .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-lightgreen .__reading_mode_data_table_class thead {
          background-color: #94CF7D;
        }
        .ms-theme-lightgreen .__reading_mode_data_table_class thead th, .ms-theme-lightgreen .__reading_mode_data_table_class thead td {
          border-color: var(--light-green-color,#F9F5E9) !important;
        }
        .ms-theme-lightgreen #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-lightgreen .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightgreen .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-lightgreen .__reading__mode__feedback__button:hover {
          background: #94CF7D;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightgreen .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-lightgreen .__reading__mode__feedback__separator {
          border-top: 1px solid #94CF7D;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightgreen .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-lightgreen div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightgreen div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-lightgreen a {
          color: var(--light-green_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightgreen a:visited {
          color: var(--light-green_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightgreen a:hover {
          color: var(--light-green_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightgreen a:active {
          color: var(--light-green_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightteal body {
          background: var(--light-teal-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-lightteal .contentBody {
          color: #333333 !important;
        }
        .ms-theme-lightteal .__reading_mode_infobox_and_collapse_button_container, .ms-theme-lightteal .__reading_mode_table_and_collapse_button_container, .ms-theme-lightteal th, .ms-theme-lightteal td, .ms-theme-lightteal caption {
          border-color: #70D8A8 !important;
        }
        .ms-theme-lightteal .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #70D8A8;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightteal .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-lightteal .__reading_mode_data_table_class thead {
          background-color: #70D8A8;
        }
        .ms-theme-lightteal .__reading_mode_data_table_class thead th, .ms-theme-lightteal .__reading_mode_data_table_class thead td {
          border-color: var(--light-teal-color,#F9F5E9) !important;
        }
        .ms-theme-lightteal #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-lightteal .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightteal .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-lightteal .__reading__mode__feedback__button:hover {
          background: #70D8A8;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightteal .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-lightteal .__reading__mode__feedback__separator {
          border-top: 1px solid #70D8A8;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightteal .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-lightteal div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightteal div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-lightteal a {
          color: var(--light-teal_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightteal a:visited {
          color: var(--light-teal_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightteal a:hover {
          color: var(--light-teal_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightteal a:active {
          color: var(--light-teal_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-turquoise body {
          background: var(--turquoise-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-turquoise .contentBody {
          color: #333333 !important;
        }
        .ms-theme-turquoise .__reading_mode_infobox_and_collapse_button_container, .ms-theme-turquoise .__reading_mode_table_and_collapse_button_container, .ms-theme-turquoise th, .ms-theme-turquoise td, .ms-theme-turquoise caption {
          border-color: #70D5D0 !important;
        }
        .ms-theme-turquoise .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #70D5D0;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-turquoise .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-turquoise .__reading_mode_data_table_class thead {
          background-color: #70D5D0;
        }
        .ms-theme-turquoise .__reading_mode_data_table_class thead th, .ms-theme-turquoise .__reading_mode_data_table_class thead td {
          border-color: var(--turquoise-color,#F9F5E9) !important;
        }
        .ms-theme-turquoise #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-turquoise .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-turquoise .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-turquoise .__reading__mode__feedback__button:hover {
          background: #70D5D0;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-turquoise .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-turquoise .__reading__mode__feedback__separator {
          border-top: 1px solid #70D5D0;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-turquoise .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-turquoise div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-turquoise div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-turquoise a {
          color: var(--turquoise_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-turquoise a:visited {
          color: var(--turquoise_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-turquoise a:hover {
          color: var(--turquoise_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-turquoise a:active {
          color: var(--turquoise_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-teal body {
          background: var(--teal-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-teal .contentBody {
          color: #333333 !important;
        }
        .ms-theme-teal .__reading_mode_infobox_and_collapse_button_container, .ms-theme-teal .__reading_mode_table_and_collapse_button_container, .ms-theme-teal th, .ms-theme-teal td, .ms-theme-teal caption {
          border-color: #72C6D1 !important;
        }
        .ms-theme-teal .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #72C6D1;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-teal .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-teal .__reading_mode_data_table_class thead {
          background-color: #72C6D1;
        }
        .ms-theme-teal .__reading_mode_data_table_class thead th, .ms-theme-teal .__reading_mode_data_table_class thead td {
          border-color: var(--teal-color,#F9F5E9) !important;
        }
        .ms-theme-teal #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-teal .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-teal .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-teal .__reading__mode__feedback__button:hover {
          background: #72C6D1;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-teal .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-teal .__reading__mode__feedback__separator {
          border-top: 1px solid #72C6D1;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-teal .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-teal div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-teal div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-teal a {
          color: var(--teal_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-teal a:visited {
          color: var(--teal_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-teal a:hover {
          color: var(--teal_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-teal a:active {
          color: var(--teal_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-skyblue body {
          background: var(--sky-blue-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-skyblue .contentBody {
          color: #333333 !important;
        }
        .ms-theme-skyblue .__reading_mode_infobox_and_collapse_button_container, .ms-theme-skyblue .__reading_mode_table_and_collapse_button_container, .ms-theme-skyblue th, .ms-theme-skyblue td, .ms-theme-skyblue caption {
          border-color: #8AC1DB !important;
        }
        .ms-theme-skyblue .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #8AC1DB;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-skyblue .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-skyblue .__reading_mode_data_table_class thead {
          background-color: #8AC1DB;
        }
        .ms-theme-skyblue .__reading_mode_data_table_class thead th, .ms-theme-skyblue .__reading_mode_data_table_class thead td {
          border-color: var(--sky-blue-color,#F9F5E9) !important;
        }
        .ms-theme-skyblue #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-skyblue .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-skyblue .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-skyblue .__reading__mode__feedback__button:hover {
          background: #8AC1DB;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-skyblue .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-skyblue .__reading__mode__feedback__separator {
          border-top: 1px solid #8AC1DB;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-skyblue .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-skyblue div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-skyblue div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-skyblue a {
          color: var(--sky-blue_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-skyblue a:visited {
          color: var(--sky-blue_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-skyblue a:hover {
          color: var(--sky-blue_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-skyblue a:active {
          color: var(--sky-blue_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightblue body {
          background: var(--light-blue-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-lightblue .contentBody {
          color: #333333 !important;
        }
        .ms-theme-lightblue .__reading_mode_infobox_and_collapse_button_container, .ms-theme-lightblue .__reading_mode_table_and_collapse_button_container, .ms-theme-lightblue th, .ms-theme-lightblue td, .ms-theme-lightblue caption {
          border-color: #9EB7DC !important;
        }
        .ms-theme-lightblue .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #9EB7DC;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightblue .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-lightblue .__reading_mode_data_table_class thead {
          background-color: #9EB7DC;
        }
        .ms-theme-lightblue .__reading_mode_data_table_class thead th, .ms-theme-lightblue .__reading_mode_data_table_class thead td {
          border-color: var(--light-blue-color,#F9F5E9) !important;
        }
        .ms-theme-lightblue #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-lightblue .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightblue .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-lightblue .__reading__mode__feedback__button:hover {
          background: #9EB7DC;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightblue .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-lightblue .__reading__mode__feedback__separator {
          border-top: 1px solid #9EB7DC;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightblue .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-lightblue div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lightblue div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-lightblue a {
          color: var(--light-blue_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightblue a:visited {
          color: var(--light-blue_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lightblue a:hover {
          color: var(--light-blue_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lightblue a:active {
          color: var(--light-blue_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lavender body {
          background: var(--lavender-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-lavender .contentBody {
          color: #333333 !important;
        }
        .ms-theme-lavender .__reading_mode_infobox_and_collapse_button_container, .ms-theme-lavender .__reading_mode_table_and_collapse_button_container, .ms-theme-lavender th, .ms-theme-lavender td, .ms-theme-lavender caption {
          border-color: #C0A9E3 !important;
        }
        .ms-theme-lavender .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #C0A9E3;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lavender .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-lavender .__reading_mode_data_table_class thead {
          background-color: #C0A9E3;
        }
        .ms-theme-lavender .__reading_mode_data_table_class thead th, .ms-theme-lavender .__reading_mode_data_table_class thead td {
          border-color: var(--lavender-color,#F9F5E9) !important;
        }
        .ms-theme-lavender #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-lavender .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lavender .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-lavender .__reading__mode__feedback__button:hover {
          background: #C0A9E3;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lavender .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-lavender .__reading__mode__feedback__separator {
          border-top: 1px solid #C0A9E3;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lavender .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-lavender div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-lavender div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-lavender a {
          color: var(--lavender_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lavender a:visited {
          color: var(--lavender_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-lavender a:hover {
          color: var(--lavender_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-lavender a:active {
          color: var(--lavender_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-orchid body {
          background: var(--orchid-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-orchid .contentBody {
          color: #333333 !important;
        }
        .ms-theme-orchid .__reading_mode_infobox_and_collapse_button_container, .ms-theme-orchid .__reading_mode_table_and_collapse_button_container, .ms-theme-orchid th, .ms-theme-orchid td, .ms-theme-orchid caption {
          border-color: #E09CE7 !important;
        }
        .ms-theme-orchid .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #E09CE7;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-orchid .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-orchid .__reading_mode_data_table_class thead {
          background-color: #E09CE7;
        }
        .ms-theme-orchid .__reading_mode_data_table_class thead th, .ms-theme-orchid .__reading_mode_data_table_class thead td {
          border-color: var(--orchid-color,#F9F5E9) !important;
        }
        .ms-theme-orchid #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-orchid .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-orchid .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-orchid .__reading__mode__feedback__button:hover {
          background: #E09CE7;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-orchid .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-orchid .__reading__mode__feedback__separator {
          border-top: 1px solid #E09CE7;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-orchid .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-orchid div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-orchid div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-orchid a {
          color: var(--orchid_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-orchid a:visited {
          color: var(--orchid_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-orchid a:hover {
          color: var(--orchid_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-orchid a:active {
          color: var(--orchid_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-pink body {
          background: var(--pink-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-pink .contentBody {
          color: #333333 !important;
        }
        .ms-theme-pink .__reading_mode_infobox_and_collapse_button_container, .ms-theme-pink .__reading_mode_table_and_collapse_button_container, .ms-theme-pink th, .ms-theme-pink td, .ms-theme-pink caption {
          border-color: #F89BCE !important;
        }
        .ms-theme-pink .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #F89BCE;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-pink .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-pink .__reading_mode_data_table_class thead {
          background-color: #F89BCE;
        }
        .ms-theme-pink .__reading_mode_data_table_class thead th, .ms-theme-pink .__reading_mode_data_table_class thead td {
          border-color: var(--pink-color,#F9F5E9) !important;
        }
        .ms-theme-pink #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-pink .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-pink .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-pink .__reading__mode__feedback__button:hover {
          background: #F89BCE;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-pink .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-pink .__reading__mode__feedback__separator {
          border-top: 1px solid #F89BCE;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-pink .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-pink div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-pink div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-pink a {
          color: var(--pink_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-pink a:visited {
          color: var(--pink_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-pink a:hover {
          color: var(--pink_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-pink a:active {
          color: var(--pink_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-carnation body {
          background: var(--carnation-color,#F9F5E9);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-carnation .contentBody {
          color: #333333 !important;
        }
        .ms-theme-carnation .__reading_mode_infobox_and_collapse_button_container, .ms-theme-carnation .__reading_mode_table_and_collapse_button_container, .ms-theme-carnation th, .ms-theme-carnation td, .ms-theme-carnation caption {
          border-color: #F692AE !important;
        }
        .ms-theme-carnation .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #F692AE;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-carnation .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-carnation .__reading_mode_data_table_class thead {
          background-color: #F692AE;
        }
        .ms-theme-carnation .__reading_mode_data_table_class thead th, .ms-theme-carnation .__reading_mode_data_table_class thead td {
          border-color: var(--carnation-color,#F9F5E9) !important;
        }
        .ms-theme-carnation #__reading__mode__sendfeedback {
          color: #333333 !important;
        }
        .ms-theme-carnation .__reading__mode__feedback__button path {
          fill: #333333 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-carnation .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-carnation .__reading__mode__feedback__button:hover {
          background: #F692AE;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-carnation .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-carnation .__reading__mode__feedback__separator {
          border-top: 1px solid #F692AE;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-carnation .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-carnation div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.48);
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-carnation div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-carnation a {
          color: var(--carnation_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-carnation a:visited {
          color: var(--carnation_default-link-color,#0072C9) !important;
          text-decoration: none !important;
        }
        .ms-theme-carnation a:hover {
          color: var(--carnation_default-link-color,#0072C9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-carnation a:active {
          color: var(--carnation_active-link-color,#097DD5) !important;
          text-decoration: underline !important;
        }
        .ms-theme-darkgrey body {
          background: var(--dark-grey-color,#242424);
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .ms-theme-darkgrey .contentBody {
          color: #B2B2B2 !important;
        }
        .ms-theme-darkgrey .__reading_mode_infobox_and_collapse_button_container, .ms-theme-darkgrey .__reading_mode_table_and_collapse_button_container, .ms-theme-darkgrey th, .ms-theme-darkgrey td, .ms-theme-darkgrey caption {
          border-color: #404040 !important;
        }
        .ms-theme-darkgrey .__reading_mode_table_and_collapse_button_container {
          box-shadow: 0 0 0 0.5pt #404040;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-darkgrey .__reading_mode_table_and_collapse_button_container {
            outline: 1px solid;
          }
        }
        .ms-theme-darkgrey .__reading_mode_data_table_class thead {
          background-color: #404040;
        }
        .ms-theme-darkgrey .__reading_mode_data_table_class thead th, .ms-theme-darkgrey .__reading_mode_data_table_class thead td {
          border-color: var(--dark-grey-color,#242424) !important;
        }
        .ms-theme-darkgrey #__reading__mode__sendfeedback {
          color: #B2B2B2 !important;
        }
        .ms-theme-darkgrey .__reading__mode__feedback__button path {
          fill: #B2B2B2 !important;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-darkgrey .__reading__mode__feedback__button path {
            fill: ButtonText !important;
          }
        }
        .ms-theme-darkgrey .__reading__mode__feedback__button:hover {
          background: #404040;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-darkgrey .__reading__mode__feedback__button:hover {
            background: Highlight;
          }
        }
        .ms-theme-darkgrey .__reading__mode__feedback__separator {
          border-top: 1px solid #404040;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-darkgrey .__reading__mode__feedback__separator {
            border-top: 1px solid ButtonText;
          }
        }
        .ms-theme-darkgrey div::-webkit-scrollbar-thumb {
          background: #7D7D7D;
        }
        @media (-ms-high-contrast:active) {
          .ms-theme-darkgrey div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .ms-theme-darkgrey a {
          color: var(--dark-grey_default-link-color,#3091DC) !important;
          text-decoration: none !important;
        }
        .ms-theme-darkgrey a:visited {
          color: var(--dark-grey_default-link-color,#3091DC) !important;
          text-decoration: none !important;
        }
        .ms-theme-darkgrey a:hover {
          color: var(--dark-grey_default-link-color,#3091DC) !important;
          text-decoration: underline !important;
        }
        .ms-theme-darkgrey a:active {
          color: var(--dark-grey_active-link-color,#1E88D9) !important;
          text-decoration: underline !important;
        }
        .ms-theme-darkgrey .progress_pages_pending {
          color: #FFFFFF !important;
        }
        .ms-theme-darkgrey #source {
          text-decoration: none !important;
        }
        .ms-theme-darkgrey #source:hover {
          text-decoration: underline !important;
        }
        .ms-fonttype-sitka body {
          font-family: "Sitka Text",Georgia, Cambria, Calibri;
          line-height: 160%;
        }
        .ms-fonttype-sitka #mainContentTitle {
          font-size: 2.412rem;
          font-family: "Sitka Heading",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka h1 {
          font-size: 2.412rem;
          font-family: "Sitka Heading",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka h2 {
          font-size: 1.754rem;
          font-family: "Sitka Heading",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka h3 {
          font-size: 1.535rem;
          font-family: "Sitka Heading",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka h4 {
          font-size: 1.315rem;
          font-family: "Sitka Heading",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka h5 {
          font-size: 1.096rem;
          font-family: "Sitka Heading",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka h6 {
          font-size: 1.096rem;
          font-family: "Sitka Heading",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka figcaption {
          font-family: "Sitka Small",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-sitka table {
          font-size: 0.877rem;
        }
        .ms-fonttype-sitka .__reading_mode_infobox_header {
          font-size: 1.315rem;
          line-height: normal;
        }
        .ms-fonttype-sitka .__reading_mode_infobox_segment_header {
          font-size: 1.315rem;
          line-height: normal;
        }
        .ms-fonttype-sitka .__reading_mode_caption_container {
          font-size: 0.877rem;
          line-height: 1.151rem;
        }
        .ms-fonttype-sitka .__reading_mode_wiki_infobox td {
          padding-bottom: 8px;
        }
        .ms-fonttype-sitka .__reading_mode_wiki_infobox th {
          padding-bottom: 8px;
        }
        .ms-fonttype-sitka .ms-linefocus-active * {
          font-family: "Sitka Text",Georgia, Cambria, Calibri;
        }
        .ms-fonttype-calibri body {
          font-family: "Calibri",sans-serif, Georgia, Cambria;
          line-height: 160%;
        }
        .ms-fonttype-calibri #mainContentTitle {
          font-size: 2.412rem;
        }
        .ms-fonttype-calibri h1 {
          font-size: 2.412rem;
        }
        .ms-fonttype-calibri h2 {
          font-size: 1.754rem;
        }
        .ms-fonttype-calibri h3 {
          font-size: 1.535rem;
        }
        .ms-fonttype-calibri h4 {
          font-size: 1.315rem;
        }
        .ms-fonttype-calibri h5 {
          font-size: 1.096rem;
        }
        .ms-fonttype-calibri h6 {
          font-size: 1.096rem;
        }
        .ms-fonttype-calibri figcaption {
          font-family: "Calibri",sans-serif, Georgia, Cambria;
          line-height: 160%;
        }
        .ms-fonttype-calibri table {
          font-size: 1rem;
        }
        .ms-fonttype-calibri .__reading_mode_infobox_header {
          font-size: 1.206rem;
          line-height: normal;
        }
        .ms-fonttype-calibri .__reading_mode_infobox_segment_header {
          font-size: 1.206rem;
          line-height: normal;
        }
        .ms-fonttype-calibri .__reading_mode_caption_container {
          font-size: 0.877rem;
          line-height: 1.151rem;
        }
        .ms-fonttype-calibri .__reading_mode_wiki_infobox td {
          padding-bottom: 8px;
        }
        .ms-fonttype-calibri .__reading_mode_wiki_infobox th {
          padding-bottom: 8px;
        }
        .ms-fonttype-calibri .ms-linefocus-active * {
          font-family: "Calibri",sans-serif, Georgia, Cambria;
        }
        .ms-fonttype-comicsans body {
          font-family: "Comic Sans MS",Georgia, Cambria, Calibri;
          line-height: 170%;
        }
        .ms-fonttype-comicsans #mainContentTitle {
          font-size: 2.138rem;
        }
        .ms-fonttype-comicsans h1 {
          font-size: 2.138rem;
        }
        .ms-fonttype-comicsans h2 {
          font-size: 1.5899rem;
        }
        .ms-fonttype-comicsans h3 {
          font-size: 1.425rem;
        }
        .ms-fonttype-comicsans h4 {
          font-size: 1.206rem;
        }
        .ms-fonttype-comicsans h5 {
          font-size: 1.042rem;
        }
        .ms-fonttype-comicsans h6 {
          font-size: 1.042rem;
        }
        .ms-fonttype-comicsans figcaption {
          font-family: "Comic Sans MS",Georgia, Cambria, Calibri;
          line-height: 170%;
        }
        .ms-fonttype-comicsans table {
          font-size: 0.877rem;
        }
        .ms-fonttype-comicsans .__reading_mode_infobox_header {
          font-size: 1.206rem;
          line-height: normal;
        }
        .ms-fonttype-comicsans .__reading_mode_infobox_segment_header {
          font-size: 1.206rem;
          line-height: normal;
        }
        .ms-fonttype-comicsans .__reading_mode_caption_container {
          font-size: 0.877rem;
          line-height: 1.261rem;
        }
        .ms-fonttype-comicsans .__reading_mode_wiki_infobox td {
          padding-bottom: 16px;
        }
        .ms-fonttype-comicsans .__reading_mode_wiki_infobox th {
          padding-bottom: 16px;
        }
        .ms-fonttype-comicsans .ms-linefocus-active * {
          font-family: "Comic Sans MS",Georgia, Cambria, Calibri;
        }
        .ms-column-type-narrow {
          max-width: 35rem;
        }
        .ms-column-type-medium {
          max-width: 45rem;
        }
        .ms-column-type-wide {
          max-width: 55rem;
        }</style><style id="content_document_stylesheet">html {
          margin: 0 !important;
          height: 100%;
          padding: 0;
        }
        body {
          width: 100%;
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
          position: relative;
          overflow-wrap: break-word;
          transition-property: background, color;
          transition-duration: .8s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .__reading_mode_caption_container {
          width: 12.555rem;
          margin-left: 1.096rem;
          font-weight: 400;
        }
        .__reading_mode_caption_container .__reading_mode_collapse_button {
          padding: initial;
          padding-top: 0.219rem;
        }
        .__reading_mode_image_and_caption_container {
          display: flex;
          margin-top: 1.0964rem;
        }
        .__reading_mode_image_and_caption_container p, .__reading_mode_image_and_caption_container img {
          margin: 0px !important;
        }
        .__reading_mode_image_and_caption_container img {
          width: 11.404rem;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          background: white;
        }
        .__reading_mode_gallery {
          padding: initial;
          list-style: none;
        }
        .__reading_mode_gallery li {
          text-align: start;
        }
        .__reading__mode__mainbody {
          margin: 0;
          padding: 0;
        }
        .__reading__mode__extracted__article__body p, .__reading__mode__extracted__article__body dl {
          padding: 0;
          hyphens: manual;
          margin-top: 1.096rem;
        }
        .header_container {
          position: relative;
          margin-left: auto;
          margin-right: auto;
        }
        .contentBody {
          width: auto;
          color: #333333;
          padding-top: 1.973rem !important;
          margin-left: auto;
          padding-left: 2.444rem;
          margin-right: auto;
          padding-right: 2.444rem;
          padding-bottom: 2.444rem;
        }
        .progress_pages_pending {
          color: #000002;
          margin-left: calc(50% - 10px);
          margin-right: auto;
        }
        .__reading__mode__bylineentries {
          margin: 0 0 36px 0;
          font-size: .66rem;
        }
        .__reading__mode__extracted__bylineentry {
          margin: 0;
          padding: 0;
          position: relative;
          line-height: 160%;
        }
        #metaDivider {
          top: -1px;
          color: #333;
          position: relative;
          font-size: 0.8rem;
        }
        #source a {
          text-decoration: none;
        }
        body * {
          margin-block-end: 0;
          margin-inline-end: 0;
          margin-block-start: 0;
          margin-inline-start: 0;
        }
        blockquote {
          margin: 1.3rem 0;
          padding: 0 2rem 0 1.3rem;
          font-size: 0.9868rem;
          font-style: italic;
        }
        ol {
          margin: 1rem 2rem 1.3rem 0;
        }
        ul {
          margin: 1rem 2rem 1.3rem 0;
        }
        .__reading_mode_collapse_button {
          fill: #0078D4;
          color: #0078D4 !important;
          border: none;
          display: flex;
          font-size: 0.768rem;
          background: transparent;
          align-items: center;
          line-height: 1.25rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI";
          justify-content: center;
        }
        .__reading_mode_collapse_button .__reading_mode_collapse_button_chevron_up {
          transform: rotate(180deg);
        }
        .__reading_mode_collapse_button svg {
          width: 1.1rem;
          height: 1.1rem;
          display: flex;
          margin-left: 6px;
          align-items: center;
          margin-right: 6px;
          justify-content: center;
          forced-color-adjust: auto;
        }
        .__reading_mode_collapse_button:hover {
          fill: #0066B4;
          color: #0066B4 !important;
          cursor: pointer;
          text-decoration: underline;
        }
        sup {
          line-height: 1;
          font-variant-numeric: lining-nums;
        }
        td {
          text-align: start;
          vertical-align: top;
        }
        th {
          text-align: start;
          vertical-align: top;
        }
        table {
          line-height: 1.3157rem;
          font-variant-numeric: tabular-nums lining-nums;
        }
        table img {
          width: auto;
          margin: 0px !important;
          display: initial !important;
        }
        table ol, table ul {
          margin: 0px;
          padding-inline-start: 1rem;
        }
        table p {
          margin-top: 0px;
          margin-bottom: 0px;
        }
        .__reading_mode_data_table_class {
          border-spacing: 0px;
          border-collapse: collapse !important;
        }
        .__reading_mode_data_table_class td:first-child, .__reading_mode_data_table_class th:first-child {
          border-inline-start: 0px;
        }
        .__reading_mode_data_table_class td:last-child, .__reading_mode_data_table_class th:last-child {
          border-inline-end: 0px;
        }
        .__reading_mode_data_table_class td, .__reading_mode_data_table_class th {
          border: 1px solid;
          padding: 10px;
        }
        .__reading_mode_data_table_class table td, .__reading_mode_data_table_class table th {
          border: 0px;
          padding: 0px;
        }
        .__reading_mode_data_table_class tr:last-child td, .__reading_mode_data_table_class tr:last-child th {
          border-bottom: 0px;
        }
        .__reading_mode_data_table_class tr:first-child td, .__reading_mode_data_table_class tr:first-child th {
          border-top: 0px;
        }
        .__reading_mode_wiki_infobox {
          box-sizing: border-box;
          margin-left: 24px;
          margin-right: 24px;
        }
        .__reading_mode_wiki_infobox th {
          width: 50%;
          border: none !important;
          padding-inline-end: 12px;
        }
        .__reading_mode_wiki_infobox td {
          width: 50%;
          border: none !important;
          padding-inline-start: 12px;
        }
        .__reading_mode_wiki_infobox th[colspan], .__reading_mode_wiki_infobox td[colspan], .__reading_mode_wiki_infobox td:first-child {
          padding-inline-end: 0px;
          padding-inline-start: 0px;
        }
        .__reading_mode_wiki_infobox .__reading_mode_image_section_table_data_parent {
          padding-top: 0px;
          padding-bottom: 0px;
        }
        .__reading_mode_wiki_infobox .__reading_mode_infobox_header {
          font-weight: bold;
          padding-top: 0px !important;
          padding-bottom: 12px;
        }
        .__reading_mode_wiki_infobox .__reading_mode_infobox_segment_header {
          padding-top: 32px;
          font-weight: bold;
        }
        .__reading_mode_wiki_infobox table {
          border-collapse: collapse;
        }
        .__reading_mode_wiki_infobox table td, .__reading_mode_wiki_infobox tableth {
          padding: 0px;
        }
        .__reading_mode_table_and_collapse_button_container {
          box-sizing: border-box;
          margin-top: 1.0964rem;
          border-radius: 4px;
        }
        .__reading_mode_table_and_collapse_button_container .__reading_mode_collapse_button {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }
        .__reading_mode_table_and_collapse_button_container .__reading_mode_table_collapsed_class, .__reading_mode_table_and_collapse_button_container .__reading_mode_table_expanded_table_class {
          box-sizing: border-box;
          border-color: inherit !important;
          border-bottom: 1px solid;
        }
        .__reading_mode_table_and_collapse_button_container caption {
          padding: 10px;
          border-bottom: 1px solid;
        }
        div::-webkit-scrollbar {
          height: 12px;
        }
        div::-webkit-scrollbar-thumb {
          border: 4px solid transparent;
          box-sizing: border-box;
          border-radius: 11px;
          background-clip: padding-box !important;
        }
        @media (-ms-high-contrast:active) {
          div::-webkit-scrollbar-thumb {
            background: ButtonText;
            forced-color-adjust: none;
          }
        }
        .__reading_mode_infobox_and_collapse_button_container {
          border-top: 4px solid;
          margin-top: 1.0964rem;
          padding-top: 24px;
          border-left: 1px solid;
          border-right: 1px solid;
          border-bottom: 1px solid;
          margin-bottom: 2.631rem;
          border-radius: 4px;
        }
        .__reading_mode_infobox_and_collapse_button_container .__reading_mode_collapse_button {
          margin-top: 10px !important;
          margin-left: 24px;
          margin-bottom: 10px !important;
        }
        .__reading_mode_infobox_and_collapse_button_container .__reading_mode_infobox_image_container {
          gap: 1.3157rem;
          display: flex;
          font-size: 0.8771rem;
          line-height: 1.0964rem;
          margin-bottom: 16px;
        }
        .__reading_mode_infobox_and_collapse_button_container .__reading_mode_table_collapsed_class {
          border-color: inherit !important;
          border-bottom: 1px solid;
        }
        .__reading_mode_infobox_and_collapse_button_container .__reading_mode_table_expanded_table_class {
          border-color: inherit !important;
          border-bottom: 1px solid;
        }
        .__reading_mode_infobox_and_collapse_button_container .__reading_mode_table_expanded_table_class .__reading_mode_infobox_image_container img {
          width: 14.418rem;
          max-width: 14.418rem;
        }
        .__reading_mode_infobox_and_collapse_button_container .__reading_mode_table_collapsed_class .__reading_mode_infobox_image_container img {
          width: 6.5789rem;
        }
        .__reading_mode_infobox_and_collapse_button_container .__reading_mode_infobox_image_container img {
          max-width: 6.578rem;
          max-height: 100% !important;
        }
        button:focus {
          outline: none;
        }
        button:focus-visible {
          outline: -webkit-focus-ring-color auto 1px;
        }
        #copyright {
          font-size: 0.8rem;
          margin-top: 2rem;
        }
        #__reading__mode__content_container {
          position: relative;
          min-height: 100vh;
        }
        #__reading__mode__sendfeedback {
          width: 100%;
          height: auto;
          bottom: 0px;
          position: absolute;
        }
        #__reading__mode__feedback__message__id {
          height: 60px;
          display: flex;
          align-items: center;
        }
        #__reading__mode__feedback__inner__message__id {
          margin: auto ! important;
          display: inline-flex;
          font-size: 14px;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI";
        }
        .__reading__mode__feedback__text {
          margin: auto 8px ! important;
        }
        .__reading__mode__feedback__button {
          width: 40px;
          border: none;
          margin: auto;
          height: 32px;
          display: flex;
          background: transparent;
          align-items: center;
          border-radius: 2px;
          justify-content: center;
        }
        .__reading__mode__feedback__button svg {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .__reading__mode__feedback__separator {
          height: 0;
          margin: 0;
          border: none;
          box-sizing: content-box;
          transition: all 0.2s ease-in-out;
        }
        h1 {
          padding: 0;
          margin-top: 2.192rem;
          font-weight: bold;
          line-height: normal;
        }
        h2 {
          padding: 0;
          margin-top: 2.192rem;
          font-weight: bold;
          line-height: normal;
        }
        h3 {
          padding: 0;
          margin-top: 2.192rem;
          font-weight: bold;
          line-height: normal;
        }
        h4 {
          padding: 0;
          margin-top: 2.192rem;
          font-weight: bold;
          line-height: normal;
        }
        h5 {
          padding: 0;
          margin-top: 2.192rem;
          font-weight: bold;
          line-height: normal;
        }
        h6 {
          padding: 0;
          margin-top: 2.192rem;
          font-weight: bold;
          line-height: normal;
        }
        #mainContentTitle {
          margin-top: 0px !important;
          font-weight: bold;
          margin-bottom: 1.535rem;
        }
        #subtitle:lang(en) {
          line-height: 1.2;
        }
        #subtitle {
          margin: 0 0 .4rem 0;
          line-height: 1.2rem;
        }
        #content_end_mark_icon_id {
          display: none;
        }
        #content_end_mark_icon_id:before {
          content: "\x15";
          font-size: 1rem;
          font-style: normal;
          font-family: Segoe MDL2 Assets;
        }
        #__reading__mode__content_end_mark_container_id {
          margin-bottom: 25px;
        }
        figure {
          margin: 1rem 0;
          text-align: center;
        }
        a {
          color: #0072C9;
          text-decoration: none;
        }
        a:visited {
          color: #0072C9;
          text-decoration: none;
        }
        a:hover {
          color: #0072C9;
          text-decoration: underline;
        }
        a:active {
          color: #097DD5;
          text-decoration: underline;
        }
        #author {
          color: #666666;
        }
        @media print {
          .__reading_mode_collapse_button {
            display: none !important;
          }
        }
        .c004 {
          opacity: 0;
          transform: translateY(80px);
        }
        .c005 {
          margin-top: 41px;
        }
        .c006 {
          transition-property: opacity, transform;
          transition-duration: .5s;
          transition-timing-function: cubic-bezier(0.25,0.10,0.25,1.00);
        }
        .c007 {
          display: block;
          min-width: 100px;
          font-size: 0.667rem;
          margin-top: 0.45rem;
          font-style: italic;
          text-align: left;
          line-height: 160%;
          break-before: avoid-column;
        }
        .c008 {
          height: auto;
          display: block;
          max-width: 100%;
          margin-top: 1.0964rem;
          max-height: 50%;
          break-inside: avoid-column;
        }
        .c009 {
          width: auto;
          height: auto;
          display: inherit;
        }
        .c0010 {
          display: none;
        }
        .c0011 {
          display: block ! important;
        }
        .c0012 {
          opacity: 0;
          visibility: hidden;
          transition: visibility 300ms, opacity 300ms cubic-bezier(0.25, 0.10, 0.25, 1.00);
        }
        .c0013:focus {
          outline: none;
        }
        @media screen and (max-width: 42rem) {
          .c0014 {
            screen and (max-width: 42rem);
          }
          .c0015 {
            width: auto;
            padding: 0.667rem;
          }
          .c0016 {
            font-size: 1.667rem;
          }
          .c0017 {
            font-size: 1.333rem;
          }
        }
        @media screen and (max-width: 801px) {
          .c0014 {
            screen and (max-width: 801px);
          }
          .c0018 {
            background: #faf7ee;
          }
        }
        </style>
      </head>
      <body>
        <div id="__reading__mode__content_container">
          <div id="contentContainer" class="contentBody ms-column-type-narrow" role="main">
            <div class="header_container" id="__reading__mode__header__container">
              <div class="header_content" id="header_content_id">
                <h1 class="__reading__mode__extracted__title c0011" id="mainContentTitle">
                  ${title}
                </h1>
              </div>
            </div>

            <div class="__reading__mode__mainbody" id="__reading__mode__mainbody__id">
              <div class="__reading__mode__extracted__article__body" id="mainContainer">
                <div>
                  <div class="entry-content">
                    ${content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>`;
  return html;
}
