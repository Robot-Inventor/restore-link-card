const url = chrome.runtime.getURL("main.js");
const script = document.createElement("script");
script.src = url;
script.addEventListener("load", () => {
    script.remove();
});
document.body.appendChild(script);
