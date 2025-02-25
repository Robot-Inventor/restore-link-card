import { Timeline, type Tweet, getColorScheme } from "twi-ext";
import { asyncQuerySelector, asyncQuerySelectorAll } from "async-query";
import { isNonEmptyArray } from "@robot-inventor/ts-utils";

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
    ) as Array<keyof typeof element>;
    return isNonEmptyArray(reactPropsName) ? (element[reactPropsName[0]] as unknown as LinkCardProps) : null;
};

const onNewTweet = async (tweet: Tweet, colorScheme: "dark" | "light"): Promise<void> => {
    const linkCards = [
        ...(await asyncQuerySelectorAll<HTMLElement>(`[data-testid='card.layoutLarge.media']`, tweet.element))
    ];

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

            thumbnail.style.opacity = "1";
            thumbnail.style.position = "static";
            thumbnail.style.aspectRatio = "1200 / 630";
            thumbnail.style.objectFit = "cover";

            anchor.style.display = "block";

            const textContainer = document.createElement("div");
            textContainer.style.color = colorScheme === "dark" ? "white" : "black";
            textContainer.style.padding = "0.75rem 0.9rem 0.9rem 0.9rem";
            textContainer.style.fontFamily = "'Segoe UI',Meiryo,system-ui,-apple-system,BlinkMacSystemFont,sans-serif";

            const domainElement = document.createElement("div");
            domainElement.textContent = reactProps.children.props.vanity || "Error";
            domainElement.style.opacity = "0.5";
            textContainer.appendChild(domainElement);

            const titleElement = document.createElement("div");
            titleElement.textContent = reactProps.children.props.title.content || "Error";
            textContainer.appendChild(titleElement);

            anchor.appendChild(textContainer);
        });
    }
};

const main = (): void => {
    const timeline = new Timeline();

    const colorScheme = getColorScheme() === "light" ? "light" : "dark";
    timeline.onNewTweet((tweet) => {
        void onNewTweet(tweet, colorScheme);
    });
};

main();
