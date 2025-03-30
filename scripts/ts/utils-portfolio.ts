// # The Power Of Five
//   by Lucilla
//
//   `utils-portfolio.ts`
//   A bunch of functions used to construct the projects and writing pages.

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
	HtmlString,
	UrlString,
	imgPath,
	Null,
	Maybe,
	randomColor,
} from "./utils.ts";



// ## Type constants

/**
 * Usually I declare types before constants, but these constants are themselves
 * used to define types, so they must come first.
 * `primaryFilters` is an array (really an "ordered set") of strings which
 * describe "primary" categories for projects on the projects page -- those
 * from which you can only pick one at a time (or all).
 * `secondaryFilters` describes the "secondary" categories: those from which
 * you can select any combination.
 * `writingFilters` describes the categories used by the writing page.
 * The same constants with an `X` prefix (standing for "extended") add more
 * values for filters used "internally", or which have some special function.
 * The arrays are constructed using *spread syntax*: `[...a, b]` means "array
 * that contains all elements of the array `a`, plus the element `b`".
 * The `as const` is TypeScript syntax for marking that the arrays won't ever
 * be modified; it lets TypeScript properly create filter types from their
 * values, rather than just assuming they're arrays of arbitrary strings.
 */

const primaryFilters = [
	"music",
	"papers",
	"code",
	"videos",
	"other",
] as const;

const secondaryFilters = [
	"major",
	"minor",
	"ancient",
] as const;

const writingFilters = [
	"math",
	"music",
	"misc",
] as const;

const primaryFiltersX = [
	...primaryFilters,
	"all",
] as const;

const secondaryFiltersX = [
	...secondaryFilters,
	"wishlist",
	"hidden",
] as const;

const writingFiltersX = [
	...writingFilters,
	"hidden",
] as const;



// ## Type declarations

/**
 * `GalleryStyle` is an enum type used to distinguish between two different
 * styles that control a few functions; it consists only of the two constant
 * strings "projects" and "writing", corresponding to the two pages that use
 * all these functions.
 * `DateTuple` is an array of 3 integers representing a date in year-month-day
 * order.
 * Next come six types derived from the constant arrays above; this is a really
 * cool trick I learned from [here](https://stackoverflow.com/a/58504957).
 * Next are `ProjectTag` and `ProjectThumb`, some simple type aliases.
 * `ProjectTag` just combines all possible non-writing tags.
 * `ProjectThumb` is `Null<UrlString>`, that is, a URL or `null`.
 * Next is `ProjectLink`, an object with keys `a` and `href`, holding the link
 * text and the URL for a link, respectively.
 * Next is `Project`, with too many fields to explain here; most are optional.
 * See below for an explanation of all the fields.
 * Finally, `ProjectJson` is an array of `Project`s. This is the type of the
 * data structure saved in `projects.json` used to generate the project
 * portfolios.
 */

type GalleryStyle = "projects" | "writing";

type DateTuple = [year: number, month: number, day: number];

type ProjectTagPrimary    = typeof primaryFilters[number];
type ProjectTagSecondary  = typeof secondaryFilters[number];
type WritingTag           = typeof writingFilters[number];
type ProjectTagPrimaryX   = typeof primaryFiltersX[number];
type ProjectTagSecondaryX = typeof secondaryFiltersX[number];
type WritingTagX          = typeof writingFiltersX[number];

type ProjectTag   = ProjectTagPrimaryX | ProjectTagSecondaryX;
type ProjectThumb = Null<UrlString>;

type ProjectLink = { a: string, href: UrlString };

type Project = {
	date?:             DateTuple,     // Date when the project was published.
	title:             string,        // Title, short form. Mandatory.
	titleFull?:        string,        // Title, long form.
	titleHyphenated?:  string,        // Title with permissible hyphenation
	                                  // breaks, explicitly marked with "^".
	writingQualifier?: string,        // Title suffix added on writing page, to
	                                  // clarify what kind of writing the
	                                  // project is, e.g. "liner notes".
	blurb?:            HtmlString,    // HTML blurb.
	writingBlurb?:     HtmlString,    // Alternate blurb for writing page.
	links?:            ProjectLink[], // List of links.
	writingLinks?:     ProjectLink[], // Alternate links for writing page.
	thumbnail?:        ProjectThumb;  // Thumbnail URL.
	thumbnailLabel?:   string;        // Non-default label text for the
	                                  // thumbnail, for when the default is
	                                  // ungrammatical or unfitting.
	tags:              ProjectTag[],  // Tag list ("ordered set"). Mandatory.
	writingTags?:      WritingTagX[], // List of writing-related tags.
}

type ProjectJson = Project[];



// ## Type predicates

/**
 * The next six functions are "type predicates", custom functions that
 * TypeScript uses to decide whether a value of some broader type (here, a
 * string) belongs to a narrower type (the various `...Tag...` types).
 * They're all really trivial, and basically check if the string shows up
 * in the array. It's a bit of a shame that TypeScript can't generate code
 * like that on its own, but at the same time, the underlying JavaScript needs
 * it, so it makes sense. You can't both have the cake and eat it, or whatever.
 */

function isProjectTagPrimary(s: string): s is ProjectTagPrimary {
	return primaryFilters.includes(s as ProjectTagPrimary);
}

function isProjectTagSecondary(s: string): s is ProjectTagSecondary {
	return secondaryFilters.includes(s as ProjectTagSecondary);
}

function isWritingTag(s: string): s is WritingTag {
	return writingFilters.includes(s as WritingTag);
}

function isProjectTagPrimaryX(s: string): s is ProjectTagPrimaryX {
	return primaryFiltersX.includes(s as ProjectTagPrimaryX);
}

function isProjectTagSecondaryX(s: string): s is ProjectTagSecondaryX {
	return secondaryFiltersX.includes(s as ProjectTagSecondaryX);
}

function isWritingTagX(s: string): s is WritingTagX {
	return writingFiltersX.includes(s as WritingTagX);
}



// ## Functions

/**
 * The majority of the functions in this file have names that start with
 * `create`, used to make HTML elements that make up the project and writing
 * galleries.
 * These functions always take the "destination" HTML element as their first
 * argument, usually named `dest` (or sometimes an object of multiple, if
 * there's more than one) -- they never create the element on the spot and
 * return it. This is for consistency with the "higher-up" `create` functions,
 * whose "destination" elements are pre-created in the HTML code of the pages
 * themselves.
 * 
 * As an aside: When these functions take an object as an argument, you might
 * notice weird assignment statements that look something like:
 * `const { a, b } = options;`
 * This is *destructuring syntax*, and it's really cool! It's short for:
 * `const a = options.a; const b = options.b;`
 * If you're used to this sort of thing, you might wonder why I don't
 * destructure in the function parameters themselves. The answer is because
 * TypeScript makes you Repeat Yourself a lot if you do, and I find that ugly:
 * (https://github.com/Microsoft/TypeScript/issues/7576)
 * 
 * P.S. Sorry that the function descriptions get a bit repetitive here. I hate
 * writing in a style like this, but these functions sadly are similar like
 * that.
 */


/**
 * `createImage`
 * Fills `dest`, an `<img>` element, with the thumbnail data in `thumb` (or a
 * default "missing" thumbnail if `thumb` is `null`).
 */
function createImage(dest: HTMLImageElement, thumb: ProjectThumb) {
	// The alt text is always empty, since thumbnails are purely decorative.
	// Even in "narrow" mobile views, which hide everything but the thumbnails,
	// the full content of each project is still visible to assistive tech.
	dest.alt = "";
	dest.src = (
		thumb === null ?
		// If `thumb` is `null`, use `unknown.png` as the thumbnail.
		`${imgPath}unknown.png` :
		// Otherwise, `thumb` is a filename; use that file.
		`${imgPath}projects/${thumb}`
	);
}


/**
 * `createLinks`
 * Fills `dest`, an `<ul>` element, with the link data in `links`.
 */
function createLinks(dest: HTMLElement, links: ProjectLink[]) {
	// If `links` is not an empty array:
	if (links.length > 0) {
		// Add the `links` class to `dest`, for CSS styling.
		dest.classList.add("links");
		for (const link of links) {
			// For each item in `links`, make an `<a>` element. The link text
			// is stored in the field `a`, and the URL is in the field `href`.
			// Wrap the `<a>` in a `<li>` and add the `<li>` to the `<ul>`.
			const li = document.createElement("li");
			const a  = document.createElement("a");
			a.href        = link.href;
			a.textContent = link.a;
			li.appendChild(a);
			dest.appendChild(li);
		}
	}
}


/**
 * `createSmall`
 * Fills `dest`, a `<small>` element, with appropriate info given the current
 * `project` and gallery `style` (`"projects"` or `"writing"`).
 */
function createSmall(
	dest:    HTMLElement,
	project: Project,
	style:   GalleryStyle
) {
	if (
		// If the date exists and is not an empty array:
		project.date &&
		project.date.length > 0 
	) {
		// Create a `<time>` element and fill both its content and its
		// `dateTime` attribute with the year number from the date.
		// Since the date is a [year, month, day] array, `date[0]` is the year.
		// It's a number, so it needs to be converted to a string.
		// (The month and day fields are actually currently completely unused.)
		const time = document.createElement("time");
		const year = project.date[0].toString();
		time.textContent = year;
		time.dateTime    = year;
		// Precede the year by a left parenthesis in `dest`. At this point,
		// `dest` looks something like "(2025".
		dest.appendChild(document.createTextNode("("));
		dest.appendChild(time);
		// If we're making the project gallery and the tag array is not empty:
		if (style === "projects" && project.tags.length > 0) {
			// Add a comma, non-breaking space (`\u00A0`), and then the first
			// tag from the tag array (which is, by convention, the "primary").
			// Now `dest` looks like "(2025, music)".
			dest.appendChild(
				document.createTextNode(`,\u00A0${project.tags[0]})`)
			);
		} else {
			// Otherwise, just close it with a right parenthesis.
			// Now `dest` looks like "(2025)".
			dest.appendChild(document.createTextNode(")"));
		}
	}
}


/**
 * `createThumb`
 * Fills `dest`, a `<section>` element, with data from `project` to create a
 * thumbnail or "thumbnail-like" part of a project.
 * 
 * Our goal is an HTML structure like the following:
 * ```html
 * <section>
 *   <a href="...">
 *     <img alt="" src="...">
 *     <span aria-hidden="true">...</span>
 *   </a>
 * </section>
 * ```
 * where either the `<img>`, or the `<span>`, or both are present, depending
 * on the case.
 */
function createThumb(dest: HTMLElement, project: Project) {
	const thumb = project.thumbnail;
	// `thumb` can be a string, `undefined`, or `null`.
	// It's `undefined` if the project JSON entry has no `thumbnail` key,
	// and it's `null` if the entry has a `thumbnail` key with value `null`.
	// `undefined` is taken to mean the entry should have no thumbnail at all;
	// `null` is taken to mean the thumbnail should be a default "missing" one.
	// ("Missing" thumbnails are currently unused on the site.)
	const noThumb = undefined === thumb; // is `thumb` `undefined`?
	const unknownThumb = null === thumb; // is `thumb` `null`?
	if (noThumb) dest.classList.add("no-thumb");
	if (unknownThumb) dest.classList.add("unknown-thumb");
	if (noThumb || unknownThumb) {
		// If `thumb` is `undefined` or `null`, we create a random
		// background color for a text-based thumbnail, for later use.
		// The `randomColor` function is imported from `utils.ts`.
		dest.style.backgroundColor = randomColor();
	}
	// If project has an array of links and the array is not empty:
	if (project.links && project.links.length > 0) {
		// Make the thumbnail a clickable link, with the URL taken from the
		// first link out of the array. Make an `<a>` element for the link.
		const firstLink = project.links[0];
		const a = document.createElement("a");
		a.href = firstLink.href;
		const label = (
			// If project explicitly specifies a label for the link, use it.
			// Otherwise, auto-generate one with the format
			// "{title} on {website}", e.g. "Ultrajoy on youtube".
			// (The nullish coalescing operator `a ?? b` means: take `a`, if it
			// "exists", i.e. isn't `undefined` or `null`; otherwise, take `b`.
			// Because this operator was added to JavaScript only in 2020, this
			// is one of the operators that gets rewritten to its literal
			// meaning by the TypeScript transpiler, for compatibility.)
			project.thumbnailLabel ??
			`${project.title} on ${firstLink.a}`
		);
		if (!noThumb) {
			// If `thumb` is a string or `null`, create an `<img>` element.
			// Fill it out using the `createImage` function.
			const img = document.createElement("img");
			createImage(img, thumb);
			a.title     = label;
			a.ariaLabel = label;
			a.appendChild(img);
		}
			// If `thumb` is `undefined` or `null`, create a `<span>` element.
			// This will be used to make a text-based thumbnail. It contains
			// the title centered horizontally and vertically on the random
			// color background generated earlier. We make it `ariaHidden` so
			// screen readers don't read out the title twice.
		if (noThumb || unknownThumb) {
			const span = document.createElement("span");
			span.textContent = project.title;
			span.ariaHidden  = "true";
			a.appendChild(span);
		}
		dest.appendChild(a);
	} else {
		// Otherwise, if we have no links, do pretty much the same except
		// without wrapping the `<img>` or `<span>` elements in an `<a>`.
		if (!noThumb) {
			const img = document.createElement("img");
			createImage(img, thumb);
			dest.appendChild(img);
		}
		if (noThumb || unknownThumb) {
			const span = document.createElement("span");
			span.textContent = project.title;
			span.ariaHidden  = "true";
			dest.appendChild(span);
		}
	}
}


/**
 * `createTitle`
 * Fills `dest`, an `<h2>` element, with data from `project` to make a title,
 * given the current gallery `style` (`"projects"` or `"writing"`).
 */
function createTitle(
	dest:    HTMLElement,
	project: Project,
	style:   GalleryStyle
) {
	let titleFull  = project.titleFull;
	let titleShort = (
		// If a hyphenated title is specified, use it and replace "^" with
		// `\u00AD`, which is a "weak hyphen" -- a normally invisible character
		// that breaks a line and shows a hyphen if the line needs to wrap.
		// Otherwise, just use the (short) title.
		project.titleHyphenated ?
		project.titleHyphenated.replace(/\^/g, "\u00AD") :
		project.title
	);

	// If we're making the writing gallery, add the qualifier, if present.
	// This step turns e.g. "Ultrajoy" to "Ultrajoy, score".
	if (style === "writing") {
		let qualifier = project.writingQualifier;
		if (qualifier) {
			if (titleFull) titleFull = `${titleFull}, ${qualifier}`;
			titleShort = `${titleShort}, ${qualifier}`;
		}
	}

	// If the full title exists:
	if (titleFull) {
		// If we're making the writing gallery, always write the full title.
		// There's enough space.
		if (style === "writing") {
			dest.textContent = titleFull;
		} else {
			// Otherwise, annotate the displayed (short) title with an
			// `<abbr>` element, so you can expand the abbreviation. We also
			// add a "visua11y hidden" copy of the full title, for screen
			// readers. This solution still isn't perfect, since mobile users
			// won't be able to expand the abbreviation, but it's the best 
			// we've got without custom tooltips. And, yes, it means some
			// screen readers will read things twice, but better twice than
			// zero times.
			const abbr = document.createElement("abbr");
			abbr.title       = titleFull;
			abbr.textContent = titleShort;
			dest.appendChild(abbr);
			const span = document.createElement("span");
			span.textContent = titleFull;
			span.classList.add("visua11y-hidden");
			dest.appendChild(span);
		}
	} else {
		// If the full title doesn't exist, just use the ("short") title.
		dest.textContent = titleShort;
	}
}


/**
 * `createCopyButton`
 * Fills `dest`, a `<button>` element, with data to make it functional as a
 * button that copies HTML to the clipboard. The function `onClick`, which
 * has no inputs and no outputs, will be called when the button is clicked.
 */
function createCopyButton(dest: HTMLElement, onClick: () => void) {
	const copyButton = document.createElement("button");
	copyButton.type = "button";
	copyButton.textContent = "copy gallery html to clipboard!";
	copyButton.onclick = onClick;
	dest.appendChild(copyButton);
}


/**
 * `createProjectControlPrimary`
 * Appends to `dest`, a `<fieldset>` element, creating a control that changes
 * the currently active "primary" project filter, based on the data from
 * `options`. Specifically, this creates an `<input type="radio">` element.
 * 
 * The `options` are:
 * - `filter`: The tag we want to make a control for.
 * - `activeFilter`: The currently active filter.
 * - `onChange`: The function (with no inputs and no outputs) that will be
 *   called when someone uses the controls to change the filter.
 * 
 * Even though it appears like `onChange` will be called twice whenever the
 * primary controls change (once for the filter that turns on, and once for the
 * one that turns off automatically as a result), it actually only gets called
 * once, namely only when it turns on -- not when it turns off:
 * (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)
 */
function createProjectControlPrimary(
	dest: HTMLFieldSetElement,
	options: {
		filter:       ProjectTagPrimaryX,
		activeFilter: ProjectTagPrimaryX,
		onChange:     () => void,
	}
) {
	const { filter, activeFilter, onChange } = options;
	const control = document.createElement("input");
	const label   = document.createElement("label");
	// Create a unique ID; it looks something like "primary-filter-music".
	const id = `primary-filter-${filter}`;
	// Set the `<input>`'s type to "radio" (a button in a set where only one
	// button is active at any given time). Group it with the other buttons in
	// the set by setting its name to "primary-filters". Give it the ID. Make
	// it checked by default if its corresponding filter also happens to be
	// the currently active filter. Make the control call `onChange` whenever
	// it changes. Finally, store the filter itself in a custom attribute
	// "data-luci-filter". ("data" is a prefix for all custom attributes;
	// "luci" is an additional prefix for ones I defined.)
	control.type    = "radio";
	control.name    = "primary-filters";
	control.id      = id;
	control.checked = filter === activeFilter;
	control.addEventListener("change", onChange);
	control.setAttribute("data-luci-filter", filter);
	// "Wire up" the label with the control by passing it its ID, and also make
	// it display text that matches the filter.
	label.htmlFor     = id;
	label.textContent = filter;
	// Add both the control and its label.
	dest.appendChild(control);
	dest.appendChild(label);
}


/**
 * `createProjectControlSecondary`
 * Appends to `dest`, a `<fieldset>` element, creating a control that toggles
 * one currently active "secondary" project filter, based on the data from
 * `options`. Specfically, this creates an `<input type="checkbox">` element.
 * 
 * The `options` are:
 * - `filter`: The tag we want to make a control for.
 * - `activeFilters`: The set of currently active filters.
 * - `onChange`: The function (with no inputs and no outputs) that will be
 *   called when someone uses the controls to toggle a filter.
 */
function createProjectControlSecondary(
	dest: HTMLFieldSetElement,
	options: {
		filter:        ProjectTagSecondary,
		activeFilters: Set<ProjectTagSecondary>,
		onChange:      () => void,
	}
) {
	const { filter, activeFilters, onChange } = options;
	const control = document.createElement("input");
	const label   = document.createElement("label");
	// Create a unique ID; it looks something like "secondary-filter-major".
	const id = `secondary-filter-${filter}`;
	// Set the `<input>`'s type to "checkbox". Group it with the other
	// checkboxes by setting its name to "secondary-filters". Give it the ID.
	// Make it checked by default if its corresponding filter is among the
	// currently active filters. Make the control call `onChange` whenever it
	// changes. Finally, store the filter itself in a custom attribute
	// "data-luci-filter".
	control.type      = "checkbox";
	control.name      = "secondary-filters";
	control.id        = id;
	control.checked   = activeFilters.has(filter);
	control.addEventListener("change", onChange);
	control.setAttribute("data-luci-filter", filter);
	// "Wire up" the label with the control by passing it its ID, and also make
	// it display text that matches the filter.
	label.htmlFor     = id;
	label.textContent = filter;
	// Add both the control and its label.
	dest.appendChild(control);
	dest.appendChild(label);
}


/**
 * `createControls`
 * Fills the `dests`, an object of three HTML elements, with controls to
 * toggle various project filters using the data in `options`.
 * 
 * The `dests` are:
 * - `projectSelection`: A `<section>` element containing all the controls.
 * - `primaryControls`: A `<fieldset>` element for choosing the primary filter.
 * - `secondaryControls`: A `<fieldset>` element for choosing the set of
 *   secondary filters.
 * 
 * The `options` are:
 * - `activePrimaryFilter`: The currently active primary filter.
 * - `activeSecondaryFilters`: A set of all currently active secondary filters.
 * - `allowCopyingHtml`: Whether a button for copying HTML should be created.
 * - `onChange`: The function (with no inputs and no outputs) to be called
 *   whenever any of the inputs change.
 * - `onCopy`: The function (with no inputs and no outputs) to be called
 *   whenever the 'copy HTML' button is clicked.
 */
function createControls(
	dests: {
		projectSelection:  HTMLElement,
		primaryControls:   HTMLFieldSetElement,
		secondaryControls: HTMLFieldSetElement
	},
	options: {
		activePrimaryFilter:    ProjectTagPrimaryX,
		activeSecondaryFilters: Set<ProjectTagSecondary>,
		allowCopyingHtml:       boolean,
		onChange:               () => void,
		onCopy:                 () => void,
	}
) {
	const {
		projectSelection,
		primaryControls,
		secondaryControls,
	} = dests;
	
	const {
		activePrimaryFilter,
		activeSecondaryFilters,
		allowCopyingHtml,
		onChange,
		onCopy,
	} = options;

	primaryControls.id   = "primary-filters";
	secondaryControls.id = "secondary-filters";
	// Create `<legend>` elements for both `<fieldset>`s.
	const primaryLegend   = document.createElement("legend");
	const secondaryLegend = document.createElement("legend");
	primaryLegend.appendChild(
		document.createTextNode("pick one:")
	);
	secondaryLegend.appendChild(
		document.createTextNode("pick zero or more:")
	);
	primaryControls.appendChild(primaryLegend);
	secondaryControls.appendChild(secondaryLegend);
	// Create a primary control for the "all" pseudo-filter...
	createProjectControlPrimary(
		primaryControls,
		{ filter: "all", activeFilter: activePrimaryFilter, onChange }
	);
	// ...and then one each for every "true" primary filter.
	for (const filter of primaryFilters) {
		createProjectControlPrimary(
			primaryControls,
			{ filter, activeFilter: activePrimaryFilter, onChange }
		);
	}
	// Create a secondary control each for every secondary filter.
	for (const filter of secondaryFilters) {
		createProjectControlSecondary(
			secondaryControls,
			{ filter, activeFilters: activeSecondaryFilters, onChange }
		);
	}
	// Add both `<fieldset>`s to the `<section>`.
	projectSelection.appendChild(primaryControls);
	projectSelection.appendChild(secondaryControls);
	// Optionally, create the "copy HTML" button.
	if (allowCopyingHtml) {
		createCopyButton(projectSelection, onCopy);
	}
}


/**
 * `createProjectGalleryEntry`
 * Fills `dest`, an `<article>` element, with data from `project` to create a
 * project gallery entry.
 * 
 * Our goal is an HTML structure like the following:
 * ```html
 * <article>
 *   <section class="project-thumbnail">
 *     (createThumb)
 *   </section>
 *   <section class="project-desc">
 *     (createTitle)
 *     (createSmall)
 *     <p>...</p>
 *     <ul class="links">...</ul>
 *   </section>
 * </article>
 * ```
 */
function createProjectGalleryEntry(dest: HTMLElement, project: Project) {
	const descSection  = document.createElement("section");
	const thumbSection = document.createElement("section");
	const title        = document.createElement("h2");
	const small        = document.createElement("small");
	// Assign some classes for CSS styling...
	dest.classList.add("project");
	descSection.classList.add("project-desc");
	thumbSection.classList.add("project-thumbnail");
	// and one each for every project tag, e.g. "music", "major".
	// These will be used to control visibility when we change the filters.
	for (const tag of project.tags) dest.classList.add(tag);
	// Create the thumbnail, title, and "(year, category)" small text.
	createThumb(thumbSection, project);
	createTitle(title, project, "projects");
	createSmall(small, project, "projects");
	// Add both the title and small text to the description section.
	descSection.appendChild(title);
	descSection.appendChild(small);
	// If the project has a blurb:
	if (project.blurb) {
		// Create a `<p>` element to store it and paste the blurb string as raw
		// HTML into the element. Then add the `<p>` to the description.
		const blurb = document.createElement("p");
		blurb.insertAdjacentHTML("beforeend", project.blurb);
		descSection.appendChild(blurb);
	}
	// If the project has links:
	if (project.links) {
		// Create a `<ul>` element to store them, make them, and then add the
		// `<ul>` to the description.
		const links = document.createElement("ul");
		createLinks(links, project.links);
		descSection.appendChild(links);
	}
	// Add the thumbnail section and description section to the `<article>`.
	dest.appendChild(thumbSection);
	dest.appendChild(descSection);
}


/**
 * `createProjectGallery`
 * Fills the `dests`, an object of two HTML elements, with data to make a
 * project gallery using the data in `options`.
 * 
 * The `dests` are:
 * - `gallery`: A `<section>` element containing the project gallery.
 * - `numMatched`: A `<p>` element displaying the number of matches for a given
 *   set of filters.
 * 
 * The `options` are:
 * - `projectJson`: A list of project data objects.
 * - `showHidden`: Whether to show projects marked as "hidden".
 * 
 * Our goal is an HTML structure like the following:
 * ```html
 * <section>
 *   <p>n matches</p>
 *   <article>
 *     (createProjectGalleryEntry)
 *   </article>
 *   (more articles)
 * </section>
 * ```
 */
function createProjectGallery(
	dests: {
		gallery:    HTMLElement,
		numMatched: HTMLElement,
	},
	options: {
		projectJson: ProjectJson,
		showHidden:  boolean,
	}
) {
	const { gallery, numMatched } = dests;
	const { projectJson, showHidden } = options;
	// Give `numMatched` an ID, some default text (just an empty string), and
	// add it to the project gallery `<section>`.
	numMatched.id = "gallery-num-matched";
	numMatched.textContent = "";
	gallery.appendChild(numMatched);
	// For every project in the list of projects:
	for (const project of projectJson) {
		// If it isn't a "wishlist" (future planned) project, and we either
		// show hidden projects or this project isn't marked as hidden:
		if (
			!project.tags.includes("wishlist") &&
			(showHidden || !project.tags.includes("hidden"))
		) {
			// Make an `<article>` element, create the project gallery entry,
			// and add the `<article>` to the gallery.
			const article = document.createElement("article");
			createProjectGalleryEntry(article, project);
			gallery.appendChild(article);
		}
	}
}


/**
 * `createWishlistEntry`
 * Fills `dest`, a `<li>` element, with data from `project` to create a project
 * wishlist entry.
 */
function createWishlistEntry(dest: HTMLElement, project: Project) {
	// Make a `<b>` element to hold the title, create it, and add it to the
	// wishlist entry.
	const title = document.createElement("b");
	createTitle(title, project, "projects");
	dest.appendChild(title);
	// If the project has a blurb:
	if (project.blurb) {
		// Paste it as raw HTML into an `<i>` element.
		const blurb = document.createElement("i");
		blurb.insertAdjacentHTML("beforeend", project.blurb);
		// Add it to the entry, separating it from the title with a colon.
		dest.appendChild(document.createTextNode(": "));
		dest.appendChild(blurb);
	}
}


/**
 * `createWishlist`
 * Fills the `dests`, an object of two HTML elements, with data to make a
 * project wishlist using the data in `options`.
 * 
 * The `dests` are:
 * - `wishlist`: A `<section>` element containing the project wishlist.
 * - `numMatched`: A `<p>` element displaying the number of matches for a given
 *   set of filters.
 * 
 * The `options` are:
 * - `projectJson`: A list of project data objects.
 * - `showHidden`: Whether to show projects marked as "hidden".
 * 
 * Our goal is an HTML structure like the following:
 * ```html
 * <section>
 *   <details>
 *     <summary>...</summary>
 *     <p>n matches</p>
 *     <h2>...</h2>
 *     <ul>
 *       <li>
 *         (createWishlistEntry)
 *       </li>
 *       (more li's)
 *     </ul>
 *     (more h2's and ul's)
 *   </details>
 * </section>
 * ```
 */
function createWishlist(
	dests: {
		wishlist:   HTMLElement,
		numMatched: HTMLElement,
	},
	options: {
		projectJson: ProjectJson,
		showHidden:  boolean,
	}
) {
	const { wishlist, numMatched } = dests;
	const { projectJson, showHidden } = options;
	// The list of projects is mostly sorted by date and "wishlist status";
	// either way, the order is pretty ad-hoc. What we want to do for the
	// wishlist, however, is to have the projects sorted primarily by their
	// *category*: all music wishes first, then all math wishes, etc.
	// So rather than going through the project list and adding each project
	// to the wishlist immediately, we'll first store them in a `Map` (aka
	// dictionary, associative array) using the primary categories as keys,
	// and then we'll add the projects from the `Map`s in their correct order.
	// Actually, we'll use two `Map`s: one for the headings for each category,
	// and one for the lists of wishes in each category.
	const headings: Map<ProjectTagPrimary, HTMLHeadingElement> = new Map();
	const ulists:   Map<ProjectTagPrimary, HTMLUListElement>   = new Map();
	// For each category, create an `<h2>` heading and a `<ul>` list to hold
	// the wishes in that category.
	for (const filter of primaryFilters) {
		const heading = document.createElement("h2");
		const ulist   = document.createElement("ul");
		// The heading's text should be the category itself. It needs a class
		// for CSS styling and an attribute `data-luci-filter` that the
		// controlling code can recognize later. Finally, add the heading to
		// the map, using the filter as the key.
		heading.textContent = filter;
		heading.classList.add("wishlist-heading");
		heading.setAttribute("data-luci-filter", filter);
		headings.set(filter, heading);
		// Do similar for the `<ul>`.
		ulist.classList.add("wishlist-list");
		ulist.setAttribute("data-luci-filter", filter);
		ulists.set(filter, ulist);
	}
	// For every project in the list of projects:
	for (const project of projectJson) {
		// If it *is* a "wishlist" project, and we either show hidden projects
		// or this project isn't marked as hidden (and the tags are not an
		// empty array, but we already know that if they contain `wishlist`):
		if (
			project.tags.includes("wishlist") &&
			(showHidden || !project.tags.includes("hidden"))
		) {
			// Make a `<li>` element and create the wishlist entry.
			const li = document.createElement("li");
			createWishlistEntry(li, project);
			// Take the first tag (which, by convention, is the primary
			// category). Get the corresponding `<ul>` from the map and add the
			// `<li>` to it.
			const firstTag = project.tags[0];
			if (isProjectTagPrimary(firstTag)) {
				const ulist = ulists.get(firstTag);
				if (ulist) ulist.appendChild(li);
			}
		}
	}
	// Make a `<details>` element to store the wishlist, so it can be expanded
	// and collapsed on demand. The corresponding `<summary>` element will say
	// "wishlist".
	const details = document.createElement("details");
	const summary = document.createElement("summary");
	summary.textContent = "wishlist";
	details.appendChild(summary);
	// Give `numMatched` an ID, some default text (just an empty string), and
	// add it to the `<details>`.
	numMatched.id = "wishlist-num-matched";
	numMatched.textContent = "";
	details.appendChild(numMatched);
	// Now, add the headings and `<ul>`s in the correct order, following the
	// order of the `primaryFilters` array. The wishlist is quite smart here:
	// the headings will be only visible when you select "all" as the primary
	// filter; after all, otherwise you'd only see a single category.
	for (const filter of primaryFilters) {
		const heading = headings.get(filter);
		const ulist = ulists.get(filter);
		// (Only if the `<ul>` isn't empty.)
		if (heading && ulist && ulist.childElementCount > 0) {
			details.appendChild(heading);
			details.appendChild(ulist);
		}
	}
	// Finally, add the `<details>` element to the wishlist.
	wishlist.appendChild(details);
}


/**
 * `createWritingGalleryEntry`
 * Fills `dest`, an `<article>` element, with data from `project` to create a
 * writing gallery entry.
 */
function createWritingGalleryEntry(dest: HTMLElement, project: Project) {
	// Create a title and "small text".
	const title = document.createElement("h2");
	const small = document.createElement("small");
	createTitle(title, project, "writing");
	createSmall(small, project, "writing");
	dest.appendChild(title);
	dest.appendChild(small);
	// Create a blurb, if the project has one. Use the `writingBlurb` if one
	// exists.
	const blurbData = project.writingBlurb ?? project.blurb;
	if (blurbData) {
		// Paste it as raw HTML and add it to the entry.
		const blurb = document.createElement("p");
		blurb.insertAdjacentHTML("beforeend", blurbData);
		dest.appendChild(blurb);
	}
	// Create links, if the project has them. Use the `writingLinks` if they
	// exist.
	const linksData = project.writingLinks ?? project.links;
	if (linksData) {
		// Put them in an `<ul>` and add them to the entry.
		const links = document.createElement("ul");
		createLinks(links, linksData);
		dest.appendChild(links);
	}
}


/**
 * Fills `dest`, a `<section>` element, with data to make a writing gallery
 * using the data in `options`.
 * 
 * The `options` are:
 * - `projectJson`: A list of project data objects.
 * - `showHidden`: Whether to show projects marked as "hidden".
 * 
 * Our goal is an HTML structure like the following:
 * ```html
 * <section>
 *   <details>
 *     <summary>...</summary>
 *     <article>
 *       (createWritingGalleryEntry)
 *     </article>
 *   </details>
 *   (more detailses)
 * </section>
 * ```
 */
function createWritingGallery(
	dest: HTMLElement,
	options: {
		projectJson: ProjectJson,
		showHidden:  boolean
	}
) {
	const { projectJson, showHidden } = options;
	// The writing gallery is made from the same `projects.json` file as the
	// project gallery. A project is marked for inclusion in the writing
	// gallery by having a `writingTags` field.
	// - Some projects "double up" as both ordinary projects and writing
	//   projects, like the Fibonacci Sort paper; they're visible in both.
	// - Others are also visible in both, but in different roles: e.g. Ultrajoy
	//   is a piece of music, but the writing gallery displays its score
	//   instead. This is done by using alternative `writingBlurb` and
	//   `writingLinks` properties, and sometimes also a `writingQualifier`
	//   that extends the title in the writing gallery by clarifying what
	//   exactly the written document is (e.g. "score", in the case of
	//   Ultrajoy).
	// - Other projects yet are visible only in the project gallery (by not
	//   having `writingTags`)...
	// - or, on the flipside, only in the writing gallery (by having the
	//   `hidden` tag among their ordinary `tags` -- this doesn't affect the
	//   writing gallery, which instead responds to the `hidden` tag among the
	//   `writingTags`).
	// We'll put each writing category (math-related, music-related, e.g. --
	// this corresponds to the `WritingTag` enum type) in its own section,
	// which we'll implement as a `<details>` element so that it can be
	// collapsed. For the same reason as with the wishlist (because we want
	// the writing gallery entries to be grouped by category first, and then
	// chronologically), we'll start by collecting all entries that belong into
	// the same category into a `Map` with `WritingTag`s as keys.
	const detailses: Map<WritingTag, HTMLDetailsElement> = new Map();
	// For all possible writing tags, make a `<details>` corresponding to that
	// tag. Add a `<summary>`, whose text is just the tag itself, add some CSS
	// classes for styling, and set the `<details>` to be open by default.
	// Add the `<details>` to the map.
	for (const filter of writingFilters) {
		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.textContent = filter;
		details.appendChild(summary);
		details.classList.add("writing-section");
		details.open = true;
		detailses.set(filter, details);
	}
	// For every project in the list of projects:
	for (const project of projectJson) {
		// If it has `writingTags` (remember? that's the sign we want to
		// include it in the writing gallery), and they are not an empty array,
		// and we either show hidden projects or this project isn't marked as
		// hidden (*in the writing tags*):
		if (
			project.writingTags &&
			(project.writingTags.length > 0) &&
			(showHidden || !project.writingTags.includes("hidden"))
		) {
			// Make an `<article>` element and create the gallery entry.
			const article = document.createElement("article");
			createWritingGalleryEntry(article, project);
			// Take the first tag (which, actually, currently is always the
			// only writing tag). Get the corresponding `<details>` from the
			// map and add the `<article>` to it.
			const firstTag = project.writingTags[0];
			if (isWritingTag(firstTag)) {
				const details = detailses.get(firstTag);
				if (details) details.appendChild(article);
			}
		}
	}
	// Now, add the `<details>`es (that's funny to say) in the correct order,
	// following the order of the `writingFilters` array.
	for (const filter of writingFilters) {
		const details = detailses.get(filter);
		// (Only if the `<details>` has at least one `<article>` child.)
		if (details && details.querySelectorAll("article").length > 0) {
			dest.appendChild(details);
		}
	}
}



// ## Exports

export {
	primaryFilters,
	secondaryFilters,
	writingFilters,
	ProjectTagPrimary,
	ProjectTagSecondary,
	WritingTag,
	ProjectTagPrimaryX,
	ProjectTagSecondaryX,
	WritingTagX,
	ProjectLink,
	Project,
	ProjectJson,
	isProjectTagPrimary,
	isProjectTagSecondary,
	isWritingTag,
	isProjectTagPrimaryX,
	isProjectTagSecondaryX,
	isWritingTagX,
	createCopyButton,
	createControls,
	createProjectGallery,
	createWishlist,
	createWritingGallery,
}
