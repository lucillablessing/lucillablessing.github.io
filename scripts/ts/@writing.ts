// # The Power Of Five
//   by Lucilla
//
//   `@writing.ts`
//   Functionality for the `writing.html` page.

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
	executeOnLoad,
	getSearchParamBool,
	just,
	toggleElement,
} from "./utils.ts";



// ## Global variables

/**
 * First, we have one variable for the writing gallery HTML element, which
 * we'll get from its ID.
 * Next, `showHidden` works just like in `@projects.ts`: it's a boolean which
 * controls whether hidden projects should be displayed.
 */

let writingGallery: HTMLElement; // `<section>` for writing gallery

let showHidden: boolean = false;



// ## Functions


/**
 * Updates the visibility of potentially hidden items in the gallery.
 */
function updateGallery(): void {
	// Some writing gallery entries are marked as hidden; they should only be
	// displayed if the `hidden` search param is set to true. But to make
	// things more complicated, I also want an entire *category* to be hidden
	// if it consists only of hidden items. Here's how I handle this.
	for (const details of writingGallery.querySelectorAll("details")) {
		// We start by assuming every category is hidden.
		let detailsVisible = false;
		for (const article of details.querySelectorAll("article")) {
			// We update the visibility of every article within it.
			const articleVisible = (
				!article.classList.contains("hidden") || showHidden
			);
			toggleElement(article, articleVisible);
			// We take the OR of the visibilities of every article within a
			// category to find out if the category itself should be visible.
			detailsVisible ||= articleVisible;
		}
		toggleElement(details, detailsVisible);
	}
}


/**
 * Do this once the page fully loads.
 */
function main(): void {
	// Get the fixed HTML elements on the page by their IDs and bind them to
	// global variables. Feed them through `just(...)` so that TypeScript knows
	// they exist (rather than being `null`) -- if for some reason they don't,
	// the function will error already here.
	writingGallery = just(document.getElementById("writing-gallery"));
	// If the search params contain "hidden", set `showHidden` to `true`, which
	// will display hidden projects.
	showHidden = getSearchParamBool("hidden");
	// Finally, update the gallery.
	updateGallery();
}



// ## Top level code

executeOnLoad(main);
