// ==UserScript==
// @name         Restore Link Card
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A browser extension to restore OGP link cards on Twitter (X)
// @author       Robot-Inventor (@keita_roboin)
// @match        https://twitter.com/**/*
// @match        https://mobile.twitter.com/**/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @downloadURL  https://raw.githubusercontent.com/Robot-Inventor/restore-link-card/main/script.js
// @updateURL    https://raw.githubusercontent.com/Robot-Inventor/restore-link-card/main/script.js
// @grant        none
// ==/UserScript==

(() => {
    "use strict";

    const getReactProps = (element) => {
        const reactPropsName = Object.getOwnPropertyNames(element).filter((name) => name.startsWith("__reactProps$"));
        return reactPropsName.length ? element[reactPropsName[0]] : null
    }

    const observer = new MutationObserver(() => {
        const MARKER_CLASS_NAME = "restore-link-card-checked";

        const linkCards = [...document.querySelectorAll(`[data-testid='card.layoutLarge.media']:not(.${MARKER_CLASS_NAME})`)].filter((card) => card.querySelector("img"));

        for (const linkCard of linkCards) {
            const reactProps = getReactProps(linkCard);
            linkCard.classList.add(MARKER_CLASS_NAME);

            if (!reactProps) return;

            const thumbnail = linkCard.querySelector("img");
            const anchor = linkCard.querySelector("a");

            anchor.appendChild(thumbnail);
            anchor.querySelectorAll("*:not(img)").forEach((element) => {
                element.remove();
            });

            thumbnail.style.height = "auto";
            thumbnail.style.opacity = "1";
            thumbnail.style.position = "static";

            anchor.style.display = "block";
            anchor.style.height = "max-content";
            anchor.style.width = "100%";

            const textColor = getComputedStyle(document.querySelector("[data-testid='User-Name'] span")).color;

            const textContainer = document.createElement("div");
            textContainer.style.color = textColor;
            textContainer.style.padding = "0.75rem";

            const domainElement = document.createElement("div");
            domainElement.textContent = reactProps.children.props.vanity || "Error";
            domainElement.style.opacity = "0.5";
            textContainer.appendChild(domainElement);

            const titleElement = document.createElement("div");
            titleElement.textContent = reactProps.children.props.title.content || "Error";
            titleElement.style.fontWeight = "bold";
            textContainer.appendChild(titleElement);

            anchor.appendChild(textContainer);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
