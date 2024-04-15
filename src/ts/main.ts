import { Timeline, Tweet } from "twi-ext";
import { asyncQuerySelector } from "async-query";

interface LinkCardProps {
    children: {
        props: {
            title: {
                content: string;
            };
            vanity: string;
        };
    };
}

const getReactProps = (element: HTMLElement): LinkCardProps | null => {
    const reactPropsName = Object.getOwnPropertyNames(element).filter((name) =>
        name.startsWith("__reactProps$")
    ) as (keyof typeof element)[];
    return reactPropsName.length ? (element[reactPropsName[0]] as unknown as LinkCardProps) : null;
};

const onNewTweet = (tweet: Tweet): void => {
    const linkCards = [...tweet.element.querySelectorAll<HTMLElement>(`[data-testid='card.layoutLarge.media']`)];

    for (const linkCard of linkCards) {
        const reactProps = getReactProps(linkCard);
        // eslint-disable-next-line no-continue
        if (!reactProps) continue;

        const thumbnailPromise = asyncQuerySelector("img", linkCard);
        const anchorPromise = asyncQuerySelector("a", linkCard);
        // eslint-disable-next-line max-statements
        void Promise.all([thumbnailPromise, anchorPromise]).then(([thumbnail, anchor]) => {
            if (!(thumbnail && anchor)) return;

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
            if (!userName) return;
            const textColor = getComputedStyle(userName).color;

            const textContainer = document.createElement("div");
            textContainer.style.color = textColor;
            textContainer.style.padding = "0.75rem 0.9rem 0.9rem 0.9rem";
            textContainer.style.fontFamily = "'Segoe UI',Meiryo,system-ui,-apple-system,BlinkMacSystemFont,sans-serif";

            const domainElement = document.createElement("div");
            domainElement.textContent = reactProps.children.props.vanity || ("Error" as string);
            domainElement.style.opacity = "0.5";
            textContainer.appendChild(domainElement);

            const titleElement = document.createElement("div");
            titleElement.textContent = reactProps.children.props.title.content || ("Error" as string);
            textContainer.appendChild(titleElement);

            anchor.appendChild(textContainer);
        });
    }
};

const timeline = new Timeline();

timeline.onNewTweet((tweet) => {
    void onNewTweet(tweet);
});
