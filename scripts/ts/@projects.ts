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
	randomColor,
	toggleElement,
} from "./utils.ts";

import {
	ProjectTagPrimaryX,
	ProjectTagSecondary,
	isProjectTagPrimaryX,
	isProjectTagSecondary,
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
 * - `showHidden` is a boolean that controls whether hidden projects should be
 *   displayed. Similarly, it's always false unless you secretly enable it.
 */

let projectsIntroDesc:   HTMLElement; // `<p>` describing the gallery
let projectWishlist:     HTMLElement; // `<section>` for wishlist
let projectGallery:      HTMLElement; // `<section>` for gallery
let projectSelection:    HTMLElement; // `<section>` for all controls
let primaryControls:     HTMLElement; // `<fieldset>` for primary controls
let secondaryControls:   HTMLElement; // `<fieldset>` for secondary controls
let wishlistNumMatched:  HTMLElement; // `<p>` saying "n matches"
let galleryNumMatched:   HTMLElement; // `<p>` saying "n matches"

let activePrimaryFilter:    ProjectTagPrimaryX       = "music";
let activeSecondaryFilters: Set<ProjectTagSecondary> = new Set(["major"]);

let showHidden: boolean = false;



// ## Functions


/**
 * Initialize the controls so that their initial state corresponds with the
 * default active primary and secondary filters.
 */
function initControls(): void {
	for (const control of primaryControls.querySelectorAll("input")) {
		// We get the filter from the "data-luci-filter" attribute.
		const filter = control.getAttribute("data-luci-filter");
		control.checked = filter === activePrimaryFilter;
	}
	for (const control of secondaryControls.querySelectorAll("input")) {
		const filter = control.getAttribute("data-luci-filter");
		control.checked = (
			// The first two lines are a sanity check for TypeScript.
			// The last one is what actually matters.
			filter !== null &&
			isProjectTagSecondary(filter) &&
			activeSecondaryFilters.has(filter)
		);
	}
}


/**
 * Add event listeners to the `<input>` elements, to make them respond to
 * changes.
 */
function makeControlListeners(): void {
	for (const control of primaryControls.querySelectorAll("input")) {
		control.addEventListener("change", updateAll);
	}
	for (const control of secondaryControls.querySelectorAll("input")) {
		control.addEventListener("change", updateAll);
	}
}


/**
 * Set the background color of text-based thumbnails to a random dark color.
 */
function randomizeColors(): void {
	for (
		const thumbnail of projectGallery.querySelectorAll(
			".project-thumbnail.no-thumb, .project-thumbnail.unknown-thumb"
		)
	) {
		if (thumbnail instanceof HTMLElement) {
			thumbnail.style.backgroundColor = randomColor();
		}
	}
}


/**
 * Refreshes the `activePrimaryFilter` and `activeSecondaryFilters` variables
 * after the controls have been tinkered with.
 */
function updateControls(): void {
	// For all primary controls:
	for (const control of primaryControls.querySelectorAll("input")) {
		// If it's checked, then (after some sanity checks) mark it as the
		// currently active primary filter. Since the primary controls are
		// `<input type="radio">`, the checked one is guaranteed to be unique.
		if (control.checked) {
			// We get the filter from the "data-luci-filter" attribute.
			const filter = control.getAttribute("data-luci-filter");
			if (filter && isProjectTagPrimaryX(filter)) {
				activePrimaryFilter = filter;
				// Since the checked one is unique, we can exit the loop early.
				break;
			}
		}
	}
	// For all secondary controls:
	for (const control of secondaryControls.querySelectorAll("input")) {
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


/**
 * @param count - Number of matched gallery elements.
 * 
 * Refreshes `galleryNumMatched` to update the new count of "matched" (i.e.
 * visible) gallery elements to `count`.
 */
function updateGalleryCount(count: number): void {
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
 * @param project - HTML element representing project to update.
 * @returns         Whether the element should be added to the matched count.
 * 
 * Refreshes a `project` correctly to be visible or invisible based on the new
 * state of the controls.
 */
function updateGalleryEntry(project: HTMLElement): boolean {
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
		(
			activePrimaryFilter !== "all" &&
			!project.classList.contains(activePrimaryFilter)
		) || (
			project.classList.contains("hidden") && !showHidden
		)
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
				// We don't have to loop through any others.
				visible = true;
				break;
			}
		}
	}
	toggleElement(project, visible);
	return visible;
}


/**
 * Refreshes `projectGallery` after the controls have been updated.
 */
function updateGallery(): void {
	// We'll keep track of how many projects are visible after the refresh with
	// a counter variable.
	let count = 0;
	for (const project of projectGallery.children) {
		if (
			project instanceof HTMLElement &&
			project.classList.contains("project")
		) {
			const visible = updateGalleryEntry(project);
			if (visible) count++;
		}
	}
	updateGalleryCount(count);
}


/**
 * @param count - Number of matched wishlist elements.
 * 
 * Refreshes `wishlistNumMatched` to update the new count of "matched" (i.e.
 * visible) gallery elements to `count`.
 */
function updateWishlistCount(count: number): void {
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
 * @param element - HTML element to update the visibility of.
 * @returns         Whether the element should be added to the matched count.
 * 
 * Refreshes an `element` correctly to be visible or invisible based on the new
 * state of the controls.
 */
function updateWishlistEntry(element: HTMLElement): boolean {
	// The element should be visible if:
	// - it's a heading AND the active primary filter is "all" (remember? we
	//   want headings to only be visible then, since otherwise we only see a
	//   single category anyway, so it'd be pointless to see a heading for it)
	//   OR
	// - it's a list AND its category matches the active primary filter.
	//   Secondary filters don't matter, since the wishlist doesn't have them.
	// Here's how I check this. 
	// We start by assuming it's invisible.
	let visible = false;
	// If it's a heading:
	if (element.classList.contains("wishlist-heading")) {
		// Make it visible only if the active primary filter is "all".
		// (Then the wishlist should look like this: "music: blah, blah, blah;
		// math: blah, blah; whatever: blah". If a true primary filter is
		// selected, it'll just show the blahs for that filter, so having the
		// corresponding heading show up is pointless.)
		toggleElement(element, activePrimaryFilter === "all");
		// Don't report headings as matches.
		return false;
	// Otherwise, if it's a list item:
	} else if (element.classList.contains("wishlist-item")) {
		// Make it visible if it matches the active primary filter, which is
		// the case if `activePrimaryFilter` is "all" or matches the element's
		// category, which we get from its "data-luci-filter" attribute.
		visible = (
			(
				!element.classList.contains("hidden") ||
				showHidden
			) && (
				activePrimaryFilter ===
				"all" ||
				activePrimaryFilter ===
				element.parentElement?.getAttribute("data-luci-filter")
			)
		);
	} else {
		// If it's neither a heading nor a list item, ignore it.
		return false;
	}
	// Make the project visible or invisible, depending on the boolean, and
	// return the visibility.
	toggleElement(element, visible);
	return visible;
}


/**
 * Refreshes `projectWishlist` after the controls have been updated.
 */
function updateWishlist(): void {
	// We'll keep track of how many wishes are visible after the refresh.
	let count = 0;
	// For every project in the wishlist, i.e. every child of the `<details>`
	// element within `projectWishlist`:
	for (
		const project of projectWishlist.querySelectorAll(
			".wishlist-heading, .wishlist-item"
		)
	) {
		if (project instanceof HTMLElement) {
			// Update its visibility state. Add to the total count.
			const visible = updateWishlistEntry(project);
			if (visible) count++;
		}
	}
	updateWishlistCount(count);
}


/**
 * Updates everything after the controls have been updated.
 */
function updateAll(): void {
	updateControls();
	updateWishlist();
	updateGallery();
}


/**
 * Do this once the page fully loads.
 */
function main() {
	// Get the fixed HTML elements on the page by their IDs and bind them to
	// global variables. Feed them through `just(...)` so that TypeScript knows
	// they exist (rather than being `null`).
	projectsIntroDesc  = just(document.getElementById("projects-intro-desc"));
	projectWishlist    = just(document.getElementById("project-wishlist"));
	projectGallery     = just(document.getElementById("project-gallery"));
	projectSelection   = just(document.getElementById("project-selection"));
	primaryControls    = just(document.getElementById("primary-filters"));
	secondaryControls  = just(document.getElementById("secondary-filters"));
	wishlistNumMatched = just(document.getElementById("wishlist-num-matched"));
	galleryNumMatched  = just(document.getElementById("gallery-num-matched"));
	// They have a "display: none;" property in their style by default, so that
	// if the page runs without JavaScript, they're invisible. Since we know
	// that JavaScript is active by the fact that we're executing this code, we
	// make them visible now.
	toggleElement(projectsIntroDesc, true);
	toggleElement(projectSelection, true);
	// If the search params contain "hidden", set `showHidden` to `true`, which
	// will display hidden projects.
	showHidden = getSearchParamBool("hidden");
	// Do some initialization stuff.
	initControls();
	makeControlListeners();
	randomizeColors();
	// Finally, update everything so that the visibility of projects matches
	// the default state of the controls ("music" and "major").
	updateAll();
}



// ## Top level code

executeOnLoad(main);
