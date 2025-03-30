// # The Power Of Five
//   by Lucilla
//
//   `@projects.ts`
//   Functionality for the `projects.html` page.

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
 * automatically converted to `1` and the expression evaluates to `3`. this
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
	dataPath,
	executeOnLoad,
	fetchJsonAndThen,
	getSearchParamBool,
	just,
	toggleElement,
} from "./utils.ts";

import {
	ProjectTagPrimaryX,
	ProjectTagSecondary,
	ProjectJson,
	isProjectTagPrimaryX,
	isProjectTagSecondary,
	createControls,
	createProjectGallery,
	createWishlist,
} from "./utils-portfolio.ts";



// ## Global variables

/**
 * First come a bunch of variables that will store HTML elements once we create
 * them or select them from the document by their IDs.
 * 
 * Then:
 * - `activePrimaryFilter` is the currently active primary filter (duh), which
 *   can be either "all" or a "true" primary filter. By default, it's "music".
 * - `activeSecondaryFilters` is a `Set` of all the active secondary filters.
 *   By default, it's a singleton containing only "major".
 * - `allowCopyingHtml` is a boolean that controls whether a button for copying
 *   HTML to the clipboard should be visible. It's always false unless you
 *   secretly enable it. How? You'll see ;)
 * - `showHidden` is a boolean that controls whether hidden projects should be
 *   displayed. Similarly, it's always false unless you secretly enable it.
 * - `projectJson` is an array of project data fetched from `projects.json`.
 */

let projectsIntroDesc:   HTMLElement;         // `<p>` describing the gallery
let projectWishlist:     HTMLElement;         // `<section>` for wishlist
let projectGallery:      HTMLElement;         // `<section>` for gallery
let projectSelection:    HTMLElement;         // `<section>` for all controls
let primaryControls:     HTMLFieldSetElement; // `<fieldset>` for primary ctrls
let secondaryControls:   HTMLFieldSetElement; // `<fieldset>` for sec'dry ctrls
let wishlistNumMatched:  HTMLElement;         // `<p>` saying "n matches"
let galleryNumMatched:   HTMLElement;         // `<p>` saying "n matches"

let activePrimaryFilter:    ProjectTagPrimaryX       = "music";
let activeSecondaryFilters: Set<ProjectTagSecondary> = new Set(["major"]);

let allowCopyingHtml = false;
let showHidden       = false;

let projectJson: ProjectJson;



// ## Functions

/**
 * `copyProjectsHtml`
 * From `gallery` and `wishlist`, creates a string of HTML for the pregenerated
 * projects page for folks that view it without JavaScript, and copies it to
 * the clipboard. From there, I paste it into the code of `projects.html`
 * manually.
 */
function copyProjectsHtml(gallery: HTMLElement, wishlist: HTMLElement) {
	// Create the string.
	const text = (
		// A little comment to mark my presence. <5
		// Then, the wishlist and gallery outer HTML, in that order.
		`
		<!-- 
		this is a static version of the project gallery, 
		for folks who have javascript disabled. 
		automagically generated by The Power Of Five! <5 
		--> 
		${wishlist.outerHTML}
		${gallery.outerHTML}
		`
		// Remove all tabs and newlines.
		.replace(/[\t\r\n]+/g, "")
		// Replace \u00A0 (non-breaking spaces) with the HTML entity, "&nbsp;".
		.replace(/\u00A0/g, "&nbsp;")
		// Replace \u00AD (weak hyphens) with the HTML entity, "&shy;".
		.replace(/\u00AD/g, "&shy;")
		// Get rid of empty style declarations.
		.replace(/style=""/g, "")
		// Replace all random background colors with black. No real reason for
		// this other than to not keep the static gallery locked onto one set
		// of colors that randomly generated for me once when I happened to
		// copy its HTML.
		.replace(/rgb\(\d+, \d+, \d+\)/g, "rgb(0, 0, 0)")
		// Add an "-s" suffix to its unique elements, to preserve unique IDs.
		.replace('id="project-wishlist"', 'id="project-wishlist-s"')
		.replace('id="project-gallery"', 'id="project-gallery-s"')
		.replace('id="wishlist-num-matched"', 'id="wishlist-num-matched-s"')
		.replace('id="gallery-num-matched"', 'id="gallery-num-matched-s"')
	);
	// Copy that string to the clipboard.
	navigator.clipboard.writeText(text);
}


/**
 * `updateControls`
 * Refreshes the `activePrimaryFilter` and `activeSecondaryFilters` variables
 * after the controls have been tinkered with. This is the `onChange` function
 * that gets sent to every element of the controls.
 */
function updateControls() {
	// For all primary controls:
	for (const control of primaryControls.children) {
		// If it's checked, then (after some sanity checks) mark it as the
		// currently active primary filter. Since the primary controls are
		// `<input type="radio">`, the checked one is guaranteed to be unique.
		if (control instanceof HTMLInputElement && control.checked) {
			// We get the filter from the "data-luci-filter" attribute.
			const filter = control.getAttribute("data-luci-filter");
			if (filter && isProjectTagPrimaryX(filter)) {
				activePrimaryFilter = filter;
			}
		}
	}
	// For all secondary controls:
	for (const control of secondaryControls.children) {
		if (control instanceof HTMLInputElement) {
			// Get its filter from the "data-luci-filter" attribute. After some
			// sanity checks, if the control is checked, add it to the set of
			// active secondary filters; otherwise, remove it from that set.
			const filter = control.getAttribute("data-luci-filter");
			if (filter && isProjectTagSecondary(filter)) {
				if (control.checked) {
					activeSecondaryFilters.add(filter);
				} else {
					activeSecondaryFilters.delete(filter);
				}
			}
		}
	}
}


/**
 * `updateGalleryCount`
 * Refreshes `galleryNumMatched` to update the new count of "matched" (i.e.
 * visible) gallery elements to `count`.
 */
function updateGalleryCount(count: number) {
	// If `count` is 0, say "no matches for these filters".
	// If `count` is 1, say "1 match".
	// Otherwise, say "<n> matches", where n is `count`.
	galleryNumMatched.textContent = (
		count === 0 ?
		"no matches for these filters" :
		count === 1 ?
		"1 match" :
		`${count} matches`
	);
	// Set the "data-luci-count" attribute to the string form of `count`.
	// This is used only in a CSS property to make it wider if `count` is 0,
	// to accommodate the longer message.
	galleryNumMatched.setAttribute("data-luci-count", count.toString());
}


/**
 * `updateGalleryEntry`
 * Refreshes a `project` correctly to be visible or invisible based on the new
 * state of the controls. Returns 1 if it's visible or 0 if not. (It could just
 * return a boolean `true`/`false`, but it returns a number for consistency
 * with the analogous function for the wishlist, which returns the total number
 * of `<li>` elements made visible or invisible within in an `<ul>`. The 1 or 0
 * can be added directly to the total count of visible elements, rather than
 * via a conditional statement like `if (visible) count++;`.)
 */
function updateGalleryEntry(project: HTMLElement): number {
	// The project should be visible if:
	// - its category matches the active primary filter AND
	// - it includes AT LEAST ONE of the active secondary filters.
	// Here's how I check this.
	// We start by assuming it's visible.
	let visible = true;
	if (
		// If the category doesn't match the active primary filter, we decide
		// it's invisible and we're done. This is the case if
		// `activePrimaryFilter` isn't "all" (so it's a "true" filter) and it
		// isn't among the project's classes (which contain a copy of all its
		// filters).
		activePrimaryFilter !== "all" &&
		!project.classList.contains(activePrimaryFilter)
	) {
		visible = false;
	} else {
		// Otherwise, we start by assuming it's *in*visible and try to find a
		// "witness" for the contrary, namely an active secondary filter that
		// *is* among the project's classes.
		visible = false;
		for (const filter of activeSecondaryFilters) {
			if (project.classList.contains(filter)) {
				// If we find a witness, we decide the project is visible.
				visible = true;
				break;
			}
		}
	}
	// Make the project visible or invisible, depending on the boolean, and
	// return 1 or 0 accordingly (`visible ? 1 : 0` means "if `visible` is
	// true, then take 1, otherwise, take 0").
	toggleElement(project, visible);
	return visible ? 1 : 0;
}


/**
 * `updateGallery`
 * Refreshes `projectGallery` after the controls have been updated.
 */
function updateGallery() {
	// We'll keep track of how many projects are visible after the refresh with
	// a counter variable.
	let count = 0;
	// For every project in the gallery:
	for (const project of projectGallery.children) {
		if (
			project instanceof HTMLElement &&
			project.classList.contains("project")
		) {
			// Update its visibility state. The function returns 1 if visible
			// and 0 if invisible (as explained earlier), so add that number
			// directly to the total count.
			const addCount = updateGalleryEntry(project);
			count += addCount;
		}
	}
	// Update the "n matches" message with the new count.
	updateGalleryCount(count);
}


/**
 * `updateWishlistCount`
 * Refreshes `wishlistNumMatched` to update the new count of "matched" (i.e.
 * visible) gallery elements to `count`.
 */
function updateWishlistCount(count: number) {
	// If `count` is 0, say "no matches for this category".
	// If `count` is 1, say "1 match".
	// Otherwise, say "<n> matches", where n is `count`.
	wishlistNumMatched.textContent = (
		count === 0 ?
		"no matches for this category" :
		count === 1 ?
		"1 match" :
		`${count} matches`
	);
	// Set the "data-luci-count" attribute to the string form of `count`.
	// This is currently unused, but I included it for consistency with the
	// behavior of the project gallery, which also does this.
	wishlistNumMatched.setAttribute("data-luci-count", count.toString());
}


/**
 * `updateWishlistEntry`
 * Refreshes an `element` correctly to be visible or invisible based on the new
 * state of the controls. Returns a number that reflects how many "matches"
 * should be added to the total count: if the element was a `<ul>` of wishes
 * and it was made visible, return the number of its children; in every other
 * case, return 0.
 */
function updateWishlistEntry(element: HTMLElement): number {
	// The element should be visible if:
	// - it's a heading AND the active primary filter is "all" (remember? we
	//   want headings to only be visible then, since otherwise we only see a
	//   single category anyway, so it'd be pointless to see a heading for it)
	//   OR
	// - it's a list AND its category matches the active primary filter.
	//   Secondary filters don't matter, since the wishlist doesn't have them.
	// Here's how I check this. 
	// We start by assuming it's invisible and the reported count is 0.
	let visible = false;
	let count = 0;
	// If it's a heading:
	if (element.classList.contains("wishlist-heading")) {
		// Make it visible only if the active primary filter is "all". Don't
		// change `count` regardless of the outcome; we don't want headings to
		// be reported as matched elements, after all.
		visible = activePrimaryFilter === "all";
	// Otherwise, if it's a list:
	} else if (element.classList.contains("wishlist-list")) {
		// Make it visible if it matches the active primary filter, which is
		// the case if `activePrimaryFilter` is "all" or matches the element's
		// category, which we get from its "data-luci-filter" attribute. (The
		// double vertical line means "or".)
		visible = (
			activePrimaryFilter === "all" ||
			activePrimaryFilter === element.getAttribute("data-luci-filter")
		);
		// If we determined it's visible, then the reported count should be
		// the number of items in the list. Otherwise, it should be 0.
		count = visible ? element.childElementCount : 0;
	} else {
		// If it's neither a heading nor a list, ignore it; the count is 0.
		return 0;
	}
	// Make the project visible or invisible, depending on the boolean, and
	// return the reported count.
	toggleElement(element, visible);
	return count;
}


/**
 * `updateWishlist`
 * Refreshes `projectWishlist` after the controls have been updated.
 */
function updateWishlist() {
	// We'll keep track of how many wishes are visible after the refresh.
	let count = 0;
	// For every project in the wishlist, i.e. every child of the `<details>`
	// element within `projectWishlist`:
	const details = projectWishlist.querySelector("details");
	if (details) {
		for (const project of details.children) {
			if (project instanceof HTMLElement) {
				// Update its visibility state. Add the reported count of
				// visible wishes to the total count.
				const addCount = updateWishlistEntry(project);
				count += addCount;
			}
		}
	}
	// Update the "n matches" message with the new count.
	updateWishlistCount(count);
}


/**
 * `updateAll`
 * Updates everything after the controls have been updated.
 */
function updateAll() {
	updateControls();
	updateWishlist();
	updateGallery();
}


/**
 * `initialize`
 * Do this once the project JSON has been retrieved.
 */
function initialize() {
	// Create the controls...
	createControls(
		{ projectSelection, primaryControls, secondaryControls },
		{
			activePrimaryFilter,
			activeSecondaryFilters,
			allowCopyingHtml,
			onChange: updateAll,
			onCopy: () => {
				copyProjectsHtml(projectGallery, projectWishlist);
			}
		}
	);
	// ...then the wishlist...
	createWishlist(
		{ wishlist: projectWishlist, numMatched: wishlistNumMatched },
		{ projectJson, showHidden }
	);
	// ...then the gallery.
	createProjectGallery(
		{ gallery: projectGallery, numMatched: galleryNumMatched },
		{ projectJson, showHidden }
	);
	// The arguments we needed to pass were a bit of a mouthful, but the
	// definitions of the functions in `utils-portfolio.ts` make them clear.

	// Finally, update everything so that the visibility of projects matches
	// the default state of the controls ("music" and "major").
	updateAll();
}


/**
 * `main`
 * Do this once the page fully loads.
 */
function main() {
	// Get the fixed HTML elements on the page by their IDs and bind them to
	// global variables. Feed them through `just(...)` so that TypeScript knows
	// they exist (rather than being `null`) -- if for some reason they don't,
	// the function will error already here.
	projectsIntroDesc = just(document.getElementById("projects-intro-desc"));
	projectWishlist   = just(document.getElementById("project-wishlist"));
	projectGallery    = just(document.getElementById("project-gallery"));
	projectSelection  = just(document.getElementById("project-selection"));
	// They have a "display: none;" property in their style by default, so that
	// if the page runs without JavaScript, they're invisible. Since we know
	// that JavaScript is active by the fact that we're executing this code, we
	// make them visible now.
	toggleElement(projectsIntroDesc, true);
	toggleElement(projectWishlist, true);
	toggleElement(projectGallery, true);
	toggleElement(projectSelection, true);
	// If the search params contain "copy", set `allowCopyingHtml` to `true`,
	// which will later create the button that copies the gallery HTML to the
	// clipboard. If they contain "hidden", set `showHidden` to `true`, which
	// will display hidden projects.
	allowCopyingHtml = getSearchParamBool("copy");
	showHidden       = getSearchParamBool("hidden");
	// Create some more elements that we'll fill out shortly.
	primaryControls    = document.createElement("fieldset");
	secondaryControls  = document.createElement("fieldset");
	wishlistNumMatched = document.createElement("p");
	galleryNumMatched  = document.createElement("p");
	// Fetch `projects.json`, put it in the `projectJson` global variable,
	// and then run `initialize`.
	fetchJsonAndThen(
		`${dataPath}projects.json`,
		json => {
			projectJson = json;
			initialize();
		}
	)
}



/**
 * Once the page loads, run `main`.
 */

executeOnLoad(main);
