import { imgPath, svgPath, svgNS, navHeight, transitionLength, just, executeOnLoad, getSessionBool, setSessionBool, randomIntInRange, toggleElement, } from "./utils.js";
let html;
let body;
let banner;
let pigeon;
let header;
let footer;
let bubbleSpace;
let headerRoot;
let footerRoot;
let headerHtml;
let footerHtml;
let topnavLinks;
let animationButton;
let bubbleButton;
let lightDarkButton;
let topnavBarButton;
let verbalButton;
let isBubbled;
let isDark;
let isAnimated;
let isVerbal;
let isTopnavOpen = false;
function getOptions() {
    var _a, _b, _c, _d;
    isDark = ((_a = getSessionBool("isDark")) !== null && _a !== void 0 ? _a : window.matchMedia("(prefers-color-scheme: dark)").matches);
    isAnimated = ((_b = getSessionBool("isAnimated")) !== null && _b !== void 0 ? _b : !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    isBubbled = (_c = getSessionBool("isBubbled")) !== null && _c !== void 0 ? _c : true;
    isVerbal = (_d = getSessionBool("isVerbal")) !== null && _d !== void 0 ? _d : false;
}
function makeBubble(bubbleSpaceSize, direction) {
    if (bubbleSpace) {
        const bubbleSize = randomIntInRange(32, 192);
        const svg = document.createElementNS(svgNS, "svg");
        const circle = document.createElementNS(svgNS, "circle");
        svg.appendChild(circle);
        svg.classList.add("bubble");
        svg.setAttribute("width", bubbleSize.toString());
        svg.setAttribute("height", bubbleSize.toString());
        svg.onclick = () => { popBubble(svg); };
        svg.ariaHidden = "true";
        if (!isBubbled)
            svg.style.display = "none";
        const xPos = `${randomIntInRange(2, bubbleSpaceSize)}%`;
        const yPos = `${randomIntInRange(10, 80)}%`;
        svg.style.top = yPos;
        if (direction === "right") {
            svg.style.right = xPos;
        }
        else {
            svg.style.left = xPos;
        }
        bubbleSpace.appendChild(svg);
    }
}
function makeBubbles() {
    var _a;
    if (bubbleSpace) {
        const numberOfLeftBubbles = randomIntInRange(1, 5);
        const numberOfRightBubbles = randomIntInRange(1, 5);
        const bubbleSpaceSize = Number((_a = bubbleSpace.getAttribute("data-luci-size")) !== null && _a !== void 0 ? _a : 10);
        for (let i = 0; i < numberOfLeftBubbles; i++) {
            makeBubble(bubbleSpaceSize, "left");
        }
        for (let i = 0; i < numberOfRightBubbles; i++) {
            makeBubble(bubbleSpaceSize, "right");
        }
    }
}
function makeButtonListeners() {
    for (const [button, onClick] of [
        [animationButton, toggleAnimations],
        [bubbleButton, toggleBubbles],
        [lightDarkButton, toggleTheme],
        [topnavBarButton, toggleTopnav],
        [verbalButton, toggleVerbal]
    ]) {
        if (button)
            button.addEventListener("click", () => { onClick(); });
    }
}
function makeButtonsVisible() {
    for (const [button, to] of [
        [animationButton, true],
        [bubbleButton, bubbleSpace !== null],
        [lightDarkButton, true],
        [verbalButton, true]
    ]) {
        if (button)
            toggleElement(button, to);
    }
}
function makeVerbal(button, text) {
    button.ariaLabel = null;
    button.textContent = text;
}
function makeNonverbal(button, src, alt) {
    button.replaceChildren();
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.width = 24;
    img.height = 24;
    button.ariaLabel = alt;
    button.appendChild(img);
}
function popBubble(bubble) {
    bubble.classList.add("popped");
}
function setActiveLink() {
    if (topnavLinks) {
        for (const link of topnavLinks.querySelectorAll("a")) {
            link.classList.remove("active");
        }
        const currentPage = body.getAttribute("data-luci-page");
        if (currentPage) {
            if (headerHtml) {
                headerHtml.setAttribute("data-luci-page", currentPage);
            }
            if (footerHtml) {
                footerHtml.setAttribute("data-luci-page", currentPage);
            }
            for (const link of topnavLinks.querySelectorAll("a")) {
                if (link.getAttribute("data-luci-link") === currentPage) {
                    link.classList.add("active");
                    break;
                }
            }
        }
    }
}
function setBannerAndPigeon() {
    if (isDark) {
        const ext = isAnimated ? "gif" : "png";
        if (banner)
            banner.src = `${imgPath}five_dark.${ext}`;
        if (pigeon)
            pigeon.src = `${imgPath}pigeon_dark.${ext}`;
    }
    else {
        if (banner)
            banner.src = `${imgPath}five.png`;
        if (pigeon)
            pigeon.src = `${imgPath}pigeon.png`;
    }
}
function setLightBackground() {
    html.style.setProperty("--body-background-light", `url("../${imgPath}tiles.png")`);
}
function setNavHeights() {
    if (topnavLinks) {
        const navHeightM = navHeight * (topnavLinks.childElementCount);
        html.style.setProperty("--nav-height", `${navHeight}px`);
        html.style.setProperty("--nav-height-mobile-open", `${navHeightM}px`);
    }
}
function toggleAnimations(on = !isAnimated) {
    isAnimated = on;
    setSessionBool("isAnimated", isAnimated);
    html.style.setProperty("--transition-length", isAnimated ? `${transitionLength}ms` : "0");
    html.style.setProperty("--body-background-dark", `url("../${imgPath}stars.${isAnimated ? "gif" : "png"}")`);
    setBannerAndPigeon();
}
function toggleBubbles(on = !isBubbled) {
    isBubbled = on;
    setSessionBool("isBubbled", isBubbled);
    for (const bubble of document.querySelectorAll(".bubble")) {
        if (bubble instanceof SVGSVGElement) {
            toggleElement(bubble, isBubbled);
        }
    }
}
function toggleTheme(theme) {
    switch (theme) {
        case "dark":
            isDark = true;
            break;
        case "light":
            isDark = false;
            break;
        default: isDark = !isDark;
    }
    setSessionBool("isDark", isDark);
    const colorScheme = isDark ? "dark" : "light";
    html.style.colorScheme = colorScheme;
    if (headerHtml)
        headerHtml.style.colorScheme = colorScheme;
    if (footerHtml)
        footerHtml.style.colorScheme = colorScheme;
    if (isDark) {
        html.classList.add("dark-mode");
        if (headerHtml)
            headerHtml.classList.add("dark-mode");
        if (footerHtml)
            footerHtml.classList.add("dark-mode");
    }
    else {
        html.classList.remove("dark-mode");
        if (headerHtml)
            headerHtml.classList.remove("dark-mode");
        if (footerHtml)
            footerHtml.classList.remove("dark-mode");
    }
    setBannerAndPigeon();
}
function toggleTopnav(on = !isTopnavOpen) {
    isTopnavOpen = on;
    if (isTopnavOpen) {
        html.classList.add("nav-open");
        if (headerHtml)
            headerHtml.classList.add("nav-open");
    }
    else {
        html.classList.remove("nav-open");
        if (headerHtml)
            headerHtml.classList.remove("nav-open");
    }
}
function toggleVerbal(on = !isVerbal) {
    isVerbal = on;
    setSessionBool("isVerbal", isVerbal);
    if (headerHtml) {
        if (isVerbal) {
            for (const [button, text] of [
                [animationButton, "toggle animations"],
                [bubbleButton, "toggle bubbles"],
                [lightDarkButton, "light/dark"],
                [topnavBarButton, "menu"]
            ]) {
                if (button)
                    makeVerbal(button, text);
            }
        }
        else {
            for (const [button, src, alt] of [
                [
                    animationButton,
                    `${svgPath}pause.svg`,
                    "toggle animations"
                ],
                [
                    bubbleButton,
                    `${svgPath}bubbles.svg`,
                    "toggle bubbles"
                ],
                [
                    lightDarkButton,
                    `${svgPath}sun_moon.svg`,
                    "toggle between light and dark mode"
                ],
                [
                    topnavBarButton,
                    `${svgPath}bars.svg`,
                    "open dropdown menu"
                ]
            ]) {
                if (button)
                    makeNonverbal(button, src, alt);
            }
        }
    }
}
function watchAnimations() {
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", e => { toggleAnimations(!e.matches); });
}
function watchTheme() {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => { toggleTheme(e.matches ? "dark" : "light"); });
}
function main() {
    var _a, _b;
    html = just(document.querySelector("html"));
    body = just(document.querySelector("body"));
    banner = document.getElementById("banner");
    pigeon = document.getElementById("pigeon");
    header = document.getElementById("header-i");
    footer = document.getElementById("footer-i");
    bubbleSpace = document.getElementById("bubble-space");
    headerRoot = (_a = header === null || header === void 0 ? void 0 : header.contentWindow) === null || _a === void 0 ? void 0 : _a.document;
    footerRoot = (_b = footer === null || footer === void 0 ? void 0 : footer.contentWindow) === null || _b === void 0 ? void 0 : _b.document;
    headerHtml = headerRoot === null || headerRoot === void 0 ? void 0 : headerRoot.querySelector("html");
    topnavLinks = headerRoot === null || headerRoot === void 0 ? void 0 : headerRoot.getElementById("topnav-links");
    animationButton = headerRoot === null || headerRoot === void 0 ? void 0 : headerRoot.getElementById("animation-button");
    bubbleButton = headerRoot === null || headerRoot === void 0 ? void 0 : headerRoot.getElementById("bubble-button");
    lightDarkButton = headerRoot === null || headerRoot === void 0 ? void 0 : headerRoot.getElementById("light-dark-button");
    topnavBarButton = headerRoot === null || headerRoot === void 0 ? void 0 : headerRoot.getElementById("topnav-bar-button");
    footerHtml = footerRoot === null || footerRoot === void 0 ? void 0 : footerRoot.querySelector("html");
    verbalButton = footerRoot === null || footerRoot === void 0 ? void 0 : footerRoot.getElementById("verbal-button");
    getOptions();
    makeBubbles();
    makeButtonListeners();
    makeButtonsVisible();
    setActiveLink();
    setLightBackground();
    setNavHeights();
    toggleAnimations(isAnimated);
    toggleTheme(isDark ? "dark" : "light");
    toggleVerbal(isVerbal);
    watchAnimations();
    watchTheme();
}
executeOnLoad(main);
