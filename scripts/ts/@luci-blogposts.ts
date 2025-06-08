// # The Power Of Five
//   by Lucilla
//
//   `@luci-blogposts.ts`
//   Functionality shared by all blog posts.

/**
 * Hi, welcome to the source code! I tried my best to make it as understandable
 * as I could to as many folks as possible, regardless of prior knowledge. Do
 * feel more than welcome to skip ahead if I'm boring you with explanations.
 *
 * This is TypeScript code. Wait, don't websites run JavaScript? TypeScript is
 * the same as JavaScript, except that it has syntax for variable types, so a
 * typechecker can automatically verify if a program uses types correctly,
 * instead of throwing errors when it runs or even silently misbehaving.
 * JavaScript is particularly bad with "making the best out of" wrong types:
 * in an expression like `2 + true`, which shouldn't make sense, `true` gets
 * automatically converted to `1` and the expression evaluates to `3`. This
 * might sound good on paper, but in practice it harms more than it helps, by
 * making it harder to spot bugs later down the line, because its quirky
 * behaviors are rarely what programmers intend. TypeScript prevents this sort
 * of thing before the program even runs, by extending JavaScript with type
 * annotations for variables, function parameters, objects, etc. (Admittedly,
 * I used TypeScript because I'm notoriously bad at not making mistakes in
 * languages that don't have automatic type checking.)
 *
 * But wait, if TypeScript is an extension of JavaScript, then how can browsers
 * run it? Well, they can't. The same tool that typechecks TypeScript code can
 * also *transpile* it to JavaScript -- though you can also turn TypeScript
 * into JavaScript by hand by simply removing all the type-related stuff. I
 * used the transpiler to generate the JavaScript, since it also performs a few
 * additional transformations, such as rewriting some newer operators in terms
 * of older ones for compatibility. And, yeah, that technically means I didn't
 * write the code your browser runs on my own, but just by comparing the
 * TypeScript and JavaScript side by side, it's clear that they're the same
 * code. The TypeScript transpiler is particularly faithful to the shape of the
 * original source code.
 *
 * Okay, that was the overly lengthy introduction! If you want more info about
 * TypeScript, see [the TypeScript website](https://www.typescriptlang.org).
 *
 * This comment block is repeated exactly the same in each .ts source file.
 * Feel more than free to skip it.
 */



// ## Imports

import {
	executeAsync,
	executeOnLoad,
	just,
} from "./utils.ts";



// ## Global variables

/**
 * The only global variables we'll need are a reference to the `<main>` element
 * and a boolean for whether this blog post requires math.
 */

let mainElement: HTMLElement;
let useMath: boolean;



// ## Functions


/**
 * Renders KaTeX within the blog post.
 */
function applyKatex(): void {
	// Dynamically import KaTeX's `auto-render.js`, whose default export is
	// the function `renderMathInElement`, which does the heavy lifting.
	import("../../extern/katex/auto-render.js").then(
		({ default: renderMathInElement }) => {
			// Delete the prerendered MathML elements.
			for (const math of mainElement.querySelectorAll("math")) {
				math.remove();
			}
			// The TeX code to render is kept in `<span class="m">` elements,
			// which are invisible by default because of their `m` class.
			// Render inside of them and remove that class.
			for (const m of mainElement.querySelectorAll(".m")) {
				if (m instanceof HTMLElement) {
					renderMathInElement(m,
						{
							delimiters: [
								{ left: "\\[", right: "\\]", display: true  },
								{ left: "\\(", right: "\\)", display: false }
							],
							output: "htmlAndMathml",
							throwOnError: false
						}
					);
					m.classList.remove("m");
				}
			}
		}
	);
}


/**
 * Gets whether this blog post requires math.
 */
function getUseMath(): void {
	// This is stored in the `data-luci-math` attribute of the main element.
	useMath = mainElement.getAttribute("data-luci-math") !== null;
}


/**
 * Render math, if this blog post needs it.
 */
function maybeRenderMath(): void {
	// Render math asynchronously, so it doesn't slow down the page.
	// Best case, it'll happen when the browser turns idle. Worst case,
	// the browser will wait 5 seconds before starting to render.
	if (useMath) executeAsync(applyKatex, 5000);
}


/**
 * Do this once the page fully loads.
 */
function main(): void {
	mainElement = just(document.getElementById("main"));
	getUseMath();
	maybeRenderMath();
}



// ## Top level code

executeOnLoad(main);
