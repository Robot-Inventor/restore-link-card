import { type ColorScheme, Timeline, type Tweet, getColorScheme, onColorSchemeChange } from "twi-ext";
import { asyncQuerySelector, asyncQuerySelectorAll } from "async-query";
import { isNonEmptyArray } from "@robot-inventor/ts-utils";

const textColorName = "--rlc-color";

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

const onNewTweet = async (tweet: Tweet): Promise<void> => {
    const linkCards = [
        ...(await asyncQuerySelectorAll<HTMLElement>(`[data-testid='card.layoutLarge.media']`, tweet.element))
    ];

    for (const linkCard of linkCards) {
        const reactProps = getReactProps(linkCard);
        // eslint-disable-next-line no-continue
        if (!reactProps) continue;

        // Prevent emojis included in the link card's title text from being retrieved due to rendering timing issues.
        const thumbnailPromise = asyncQuerySelector<HTMLImageElement>(
            "img:not([src^='https://abs-0.twimg.com/emoji'])",
            linkCard
        );
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
            textContainer.style.color = `var(${textColorName})`;
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

const updateTextColor = (colorScheme: ColorScheme): void => {
    const darkOrLight = colorScheme === "light" ? "light" : "dark";
    document.body.style.setProperty(textColorName, darkOrLight === "dark" ? "white" : "black");
};

const main = (): void => {
    const timeline = new Timeline();

    const colorScheme = getColorScheme();
    updateTextColor(colorScheme);
    onColorSchemeChange(updateTextColor);

    timeline.onNewTweet((tweet) => {
        void onNewTweet(tweet);
    });
};

main();
