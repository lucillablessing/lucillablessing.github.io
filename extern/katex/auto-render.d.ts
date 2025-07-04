import { KatexOptions } from "./katex.js";

declare namespace renderMathInElement {
    interface RenderMathInElementSpecificOptionsDelimiters {
        /**
         * A string which starts the math expression (i.e. the left delimiter)
         */
        left: string;
        /**
         * A string which ends the math expression (i.e. the right delimiter)
         */
        right: string;
        /**
         * A boolean of whether the math in the expression should be rendered in display mode or not
         */
        display: boolean;
    }

    interface RenderMathInElementSpecificOptions {
        /**
         * A list of delimiters to look for math
         *
         * @default [
         *   {left: "$$", right: "$$", display: true},
         *   {left: "\\(", right: "\\)", display: false},
         *   {left: "\\[", right: "\\]", display: true}
         * ]
         */
        delimiters?: readonly RenderMathInElementSpecificOptionsDelimiters[] | undefined;
        /**
         * A list of DOM node types to ignore when recursing through
         *
         * @default ["script", "noscript", "style", "textarea", "pre", "code"]
         */
        ignoredTags?: ReadonlyArray<keyof HTMLElementTagNameMap> | undefined;
        /**
         * A list of DOM node class names to ignore when recursing through
         *
         * @default []
         */
        ignoredClasses?: string[] | undefined;

        /**
         * A callback method returning a message and an error stack in case of an critical error during rendering
         * @param msg Message generated by KaTeX
         * @param err Caught error
         *
         * @default console.error
         */
        errorCallback?(msg: string, err: Error): void;
    }

    /**
     * renderMathInElement options contain KaTeX render options and renderMathInElement specific options
     */
    type RenderMathInElementOptions = KatexOptions & RenderMathInElementSpecificOptions;
}

/**
 * Auto-render TeX expressions in HTML element
 * @param elem HTML element to auto-render
 * @param options Render options
 */
declare function renderMathInElement(elem: HTMLElement, options?: renderMathInElement.RenderMathInElementOptions): void;

export = renderMathInElement;
export as namespace renderMathInElement;
