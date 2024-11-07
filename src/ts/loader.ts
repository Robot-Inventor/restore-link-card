import { runtime } from "webextension-polyfill";

const url = runtime.getURL("js/main.js");
const script = document.createElement("script");
script.src = url;
script.addEventListener("load", () => {
    script.remove();
});
document.body.appendChild(script);
