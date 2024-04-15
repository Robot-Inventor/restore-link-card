import { Timeline } from "twi-ext";
import { asyncQuerySelector } from "async-query";

const getReactProps = (element: HTMLElement) => {
    const reactPropsName = Object.getOwnPropertyNames(element).filter((name) =>
        name.startsWith("__reactProps$")
    ) as (keyof typeof element)[];
    return reactPropsName.length ? element[reactPropsName[0]] : null;
};

const timeline = new Timeline();

timeline.onNewTweet(async (tweet) => {
    const linkCards = [...tweet.element.querySelectorAll<HTMLElement>(`[data-testid='card.layoutLarge.media']`)];

    for (const linkCard of linkCards) {
        const reactProps = getReactProps(linkCard);
        if (!reactProps) continue;

        const thumbnail = await asyncQuerySelector("img", linkCard);
        const anchor = await asyncQuerySelector("a", linkCard);
        if (!(thumbnail && anchor)) continue;

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

        const userName = document.querySelector("[data-testid='User-Name'] span");
        if (!userName) continue;
        const textColor = getComputedStyle(userName).color;

        const textContainer = document.createElement("div");
        textContainer.style.color = textColor;
        textContainer.style.padding = "0.75rem 0.9rem 0.9rem 0.9rem";
        textContainer.style.fontFamily = "'Segoe UI',Meiryo,system-ui,-apple-system,BlinkMacSystemFont,sans-serif";

        const domainElement = document.createElement("div");
        // @ts-expect-error
        domainElement.textContent = reactProps.children.props.vanity || "Error";
        domainElement.style.opacity = "0.5";
        textContainer.appendChild(domainElement);

        const titleElement = document.createElement("div");
        // @ts-expect-error
        titleElement.textContent = reactProps.children.props.title.content || "Error";
        textContainer.appendChild(titleElement);

        anchor.appendChild(textContainer);
    }
});
