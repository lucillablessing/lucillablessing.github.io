import { executeAsync, executeOnLoad, just, } from "./utils.js";
let mainElement;
let useMath;
function applyKatex() {
    import("../../extern/katex/auto-render.js").then(({ default: renderMathInElement }) => {
        for (const math of mainElement.querySelectorAll("math")) {
            math.remove();
        }
        for (const m of mainElement.querySelectorAll(".m")) {
            if (m instanceof HTMLElement) {
                renderMathInElement(m, {
                    delimiters: [
                        { left: "\\[", right: "\\]", display: true },
                        { left: "\\(", right: "\\)", display: false }
                    ],
                    output: "htmlAndMathml",
                    throwOnError: false
                });
                m.classList.remove("m");
            }
        }
    });
}
function getUseMath() {
    useMath = mainElement.getAttribute("data-luci-math") !== null;
}
function maybeRenderMath() {
    if (useMath)
        executeAsync(applyKatex, 5000);
}
function main() {
    mainElement = just(document.getElementById("main"));
    getUseMath();
    maybeRenderMath();
}
executeOnLoad(main);
