// # The Power Of Five
//   by Lucilla
//
//   `@luci.ts`
//   Functionality shared by all pages.

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
	imgPath,
	svgPath,
	svgNS,
	navHeight,
	transitionLength,
	Null,
	Maybe,
	just,
	executeOnLoad,
	getSessionBool,
	setSessionBool,
	randomIntInRange,
	toggleElement,
} from "./utils.ts";



// ## Type declarations

/**
 * This section just has two simple enum types: `ColorScheme` and `Direction`.
 * They're both pretty self-explanatory. Each consists of just two constant
 * string values.
 */

type ColorScheme = "dark" | "light";
type Direction   = "left" | "right";



// ## Global variables

/**
 * To begin with, there's a gigantic number of global variables for HTML
 * elements, all of which we'll attempt to get from the document by their IDs.
 * Not all will exist on every page; the ones that might not are marked with a
 * `Null<...>` type (or sometimes a `Maybe<...>` type, which also includes
 * `undefined`, for convenience with the nullish coalescing operator).
 * 
 * Next, we have five boolean variables that control global toggles for the
 * site: `isBubbled` whether bubbles are visible, `isDark` whether the site is
 * in dark mode, `isAnimated` whether animations are on, `isVerbal` whether
 * buttons should display words instead of icons, and `isTopnavOpen` whether
 * the dropdown menu on mobile is open. Only `isTopnavOpen` gets initialized;
 * the remaining variables will first attempt to get their values from session
 * storage, so they can carry over from the previous page.
 */

let html:            HTMLElement;
let body:            HTMLElement;
let banner:          Null<HTMLImageElement>;
let pigeon:          Null<HTMLImageElement>;
let header:          Null<HTMLIFrameElement>;
let footer:          Null<HTMLIFrameElement>;
let bubbleSpace:     Null<HTMLElement>;
let headerRoot:      Maybe<Document>;
let footerRoot:      Maybe<Document>;
let headerHtml:      Maybe<HTMLElement>;
let footerHtml:      Maybe<HTMLElement>;
let topnavLinks:     Maybe<HTMLElement>;
let animationButton: Maybe<HTMLElement>;
let bubbleButton:    Maybe<HTMLElement>;
let lightDarkButton: Maybe<HTMLElement>;
let topnavBarButton: Maybe<HTMLElement>;
let verbalButton:    Maybe<HTMLElement>;

let isBubbled:  boolean;
let isDark:     boolean;
let isAnimated: boolean;
let isVerbal:   boolean;
let isTopnavOpen = false;



// ## Functions

/**
 * `getOptions`
 * Initialize the four global toggles (all but `isTopnavOpen`), by first trying
 * to fetch them from session storage, and if they're not found there, giving
 * them sensible default values.
 */
function getOptions() {
	// If `isDark` isn't found in session storage, set it to whether the
	// browser prefers dark color schemes. (`??` is the "nullish coalescing
	// operator"; `a ?? b` means "`a`, if it's not `undefined` or `null`;
	// otherwise, `b`". This is one of the operators that gets rewritten to its
	// literal meaning in the JavaScript code, because it's relatively new to
	// JavaScript (added in 2020), so the TypeScript transpiler converts it for
	// compatibility.)
	isDark = (
		getSessionBool("isDark") ??
		window.matchMedia("(prefers-color-scheme: dark)").matches
	);
	// If `isAnimated` isn't found in session storage, set it to whether the
	// browser DOESN'T prefer reduced motion. (If it does, make it `false`;
	// otherwise, make it `true`.)
	isAnimated = (
		getSessionBool("isAnimated") ??
		!window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
	// `isBubbled` and `isVerbal` get initialized to `true` and `false` by
	// default, respectively.
	isBubbled = getSessionBool("isBubbled") ?? true;
	isVerbal  = getSessionBool("isVerbal")  ?? false;
}


/**
 * `makeBubble`
 * Makes a bubble on the side of the screen, anywhere within the specified
 * `bubbleSpaceSize` (roughly speaking, a percentage of the viewport width; see
 * the function `makeBubbles` below for specifics) and in the specified
 * `direction` (either "left" or "right").
 */
function makeBubble(bubbleSpaceSize: number, direction: Direction) {
	// If the page has a `bubbleSpace` element, where the bubbles live, then do
	// stuff. (Didn't I already check for that in `makeBubbles`, below? I
	// sadly have to check a second time, because TypeScript won't propagate
	// type inference through function calls like that. Why won't I just use a
	// non-null assertion? I try not to have any type assertions, because
	// they're unsafe. Better test twice than bug once, in this case.)
	if (bubbleSpace) {
		// Choose a random size for the bubble between 32px and 192px.
		const bubbleSize = randomIntInRange(32, 192);
		// Create an SVG for the bubble, and within it, a `<circle>` element.
		const svg    = document.createElementNS(svgNS, "svg");
		const circle = document.createElementNS(svgNS, "circle");
		svg.appendChild(circle);
		// For CSS styling and transition purposes, give it the "bubble" class.
		svg.classList.add("bubble");
		// Set its width and height both to `bubbleSize` (converted to a
		// string, because SVG is weird like that).
		svg.setAttribute("width", bubbleSize.toString());
		svg.setAttribute("height", bubbleSize.toString());
		// Make it pop itself when clicked.
		svg.onclick = () => { popBubble(svg); };
		// Make it hidden to assistive tech.
		svg.ariaHidden = "true";
		// If bubbles are toggled off, make it hidden altogether.
		if (!isBubbled) svg.style.display = "none";
		// Choose a random position on the screen: x anywhere from 2% to
		// bubbleSpaceSize%, and y anywhere from 10% to 80%.
		const xPos = `${randomIntInRange(2, bubbleSpaceSize)}%`;
		const yPos = `${randomIntInRange(10, 80)}%`;
		// Set the bubble's position.
		svg.style.top = yPos;
		if (direction === "right") {
			svg.style.right = xPos;
		} else {
			svg.style.left  = xPos;
		}
		// Add the bubble to the bubble space.
		bubbleSpace.appendChild(svg);
	}
}


/**
 * `makeBubbles`
 * Populates the "bubble space" with bubbles, if it exists.
 */
function makeBubbles() {
	// If the page has a `bubbleSpace` element, where the bubbles live:
	if (bubbleSpace) {
		// Choose how many left and right bubbles to generate: 1, 2, 3, or 4.
		const numberOfLeftBubbles  = randomIntInRange(1, 5);
		const numberOfRightBubbles = randomIntInRange(1, 5);
		// Get the 'size' of the bubble space from the "data-luci-size"
		// attribute. ("data" is a prefix for custom attributes; "luci" is
		// another prefix I use for those that I defined.) It's stored as a
		// string, so I need to convert it to a number. If it wasn't found,
		// choose 10 as a default. (Converting the number 10 to a number does
		// nothing, but it's not an error either. (Shouldn't the nullish
		// coalescing be outside the `Number` function? Sadly no, because
		// `Number` converts `null` to 0, and 0 isn't nullish. I could replace
		// `??` with `||`, a logical "or", but that'd just obfuscate the
		// code.))

		// The "size" is a percentage of the viewport width, and specifies how
		// far from the left or right border a bubble can spawn. For instance,
		// a size of 10 means bubbles can only spawn in the leftmost 10% or the
		// rightmost 10% of the viewport (roughly).
		const bubbleSpaceSize = Number(
			bubbleSpace.getAttribute("data-luci-size") ?? 10
		);
		// Make the left and right bubbles by calling `makeBubble` n times,
		// where n = `numberOfLeftBubbles` or `numberOfRightBubbles`.
		for (let i = 0; i < numberOfLeftBubbles; i++) {
			makeBubble(bubbleSpaceSize, "left");
		}
		for (let i = 0; i < numberOfRightBubbles; i++) {
			makeBubble(bubbleSpaceSize, "right");
		}
	}
}


/**
 * `makeButtonListeners`
 * Gives the toggle buttons "event listeners", that is, makes them responsive
 * to click events by calling functions when they're clicked.
 */
function makeButtonListeners() {
	// Loop over all five buttons paired with corresponding functions.
	// (The "as const" is just for TypeScript to infer types correctly.
	// Otherwise, it fails to recognize this as an array of 2-tuples and thinks
	// it's an array of arrays that can hold buttons and functions in any
	// order. Silly TypeScript.)
	for (const [button, onClick] of [
		[animationButton, toggleAnimations],
		[bubbleButton,    toggleBubbles],
		[lightDarkButton, toggleTheme],
		[topnavBarButton, toggleTopnav],
		[verbalButton,    toggleVerbal]
	] as const) {
		// If a button exists, add to it an "event listener" that "listens" for
		// a click event, and when it happens, call its corresponding function.
		if (button) button.addEventListener(
			// (Wrap the function in an arrow expression to "force" its arity
			// to 0.)
			"click", () => { onClick(); }
		);
	}
}


/**
 * `makeButtonsVisible`
 * Makes the buttons visible. See below to understand why.
 */
function makeButtonsVisible() {
	// We're toggling all the buttons to be visible, because by default, in the
	// source HTML files, they're made invisible. This is so that they stay
	// invisible if the page doesn't load JavaScript. In that case, they don't
	// work anyway, so why should they even show up? And logically, since
	// JavaScript is what gives dynamic behavior, the HTML files should be
	// configured for the version of the page that doesn't have JavaScript.
	for (const [button, to] of [
		// Toggle all the buttons on, except that the bubble button should only
		// be made visible on pages that have a bubble space. Otherwise, it'd
		// be pointless, after all.
		[animationButton, true],
		[bubbleButton,    bubbleSpace !== null],
		[lightDarkButton, true],
		[verbalButton,    true]
	] as const) {
		if (button) toggleElement(button, to);
	}
}


/**
 * `makeVerbal`
 * Makes the `button` verbal (so it displays `text` rather than an SVG icon).
 */
function makeVerbal(button: HTMLElement, text: string) {
	// Remove the ARIA label, since it's not necessary when there's text.
	button.ariaLabel   = null;
	button.textContent = text;
}


/**
 * `makeNonverbal`
 * Makes the `button` nonverbal (so it displays an SVG icon at path `src` with
 * label `alt`, rather than text).
 */
function makeNonverbal(button: HTMLElement, src: string, alt: string) {
	// `.replaceChildren();` is a quick and dirty way to clear all child
	// elements (https://stackoverflow.com/a/65413839). In this case, we're
	// just removing the button's only child element, a text node.
	button.replaceChildren();
	// Add an `<img>`, which is an SVG image, as the content of the button.
	// I also add an ARIA label for assistive tech, which I think shouldn't be
	// necessary if the image already has alt text, but it's better to play it
	// safe -- better announce things twice than zero times.
	const img  = document.createElement("img");
	img.src    = src;
	img.alt    = alt;
	img.width  = 24;
	img.height = 24;
	button.ariaLabel = alt;
	button.appendChild(img);
}


/**
 * `popBubble`
 * Pops `bubble`. (This is just one statement, but in case I was going to add
 * more, I put it in its own function.)
 */
function popBubble(bubble: SVGSVGElement) {
	// Add "popped" to the classes of `bubble`. CSS transitions do the rest.
	bubble.classList.add("popped");
}


/**
 * `setActiveLink`
 * Changes the "active" link in the topnav to be the current page. (I *could*
 * do this manually on a per-page basis, but that would require me to repeat
 * the topnav code in every html file except for the active link being
 * different each time. I embed the topnav through an `<iframe>` instead,
 * specifically so I can avoid this repetition, which means I need to adjust it
 * dynamically using this function.)
 */
function setActiveLink() {
	// If the topnav links exist:
	if (topnavLinks) {
		// Firstly, make them all inactive.
		for (const link of topnavLinks.querySelectorAll("a")) {
			link.classList.remove("active");
		}
		// Figure out what page we're on, by getting it from the
		// "data-luci-page" attribute of the `<body>` element.
		const currentPage = body.getAttribute("data-luci-page");
		// If that attribute exists:
		if (currentPage) {
			// Copy it to the header and footer. This is necessary for some CSS
			// to work correctly.
			if (headerHtml) {
				headerHtml.setAttribute("data-luci-page", currentPage);
			}
			if (footerHtml) {
				footerHtml.setAttribute("data-luci-page", currentPage);
			}
			// Find a link whose "data-luci-link" attribute matches the
			// "data-luci-page" attribute we just found, and make it active.
			for (const link of topnavLinks.querySelectorAll("a")) {
				if (link.getAttribute("data-luci-link") === currentPage) {
					link.classList.add("active");
					// There's at most one such link, so once we found one, we
					// can break out of the loop.
					break;
				}
			}
		}
	}
}


/**
 * `setBannerAndPigeon`
 * Updates the banner and pigeon image sources dynamically, when the toggles
 * for dark mode and animations change.
 * 
 * The website banner appears on the homepage (`index.html`), and an image of a
 * pigeon appears on the "not found" page (`404.html`). They're both static in
 * light mode, but can have animations in dark mode, which can be turned off.
 */
function setBannerAndPigeon() {
	// If we're in dark mode:
	if (isDark) {
		// Then the images have a static version and an animated one. Choose
		// which one to apply. The file names are identical, except that the
		// static one is a png and the animated one is a gif. (`a ? b : c`
		// means "if `a` is true, pick `b`; otherwise, pick `c`".)
		const ext = isAnimated ? "gif" : "png";
		// If the banner and pigeon exist, respectively, update their sources
		// to the file with the right extension.
		if (banner) banner.src = `${imgPath}five_dark.${ext}`;
		if (pigeon) pigeon.src = `${imgPath}pigeon_dark.${ext}`;
	} else {
		// Otherwise, we're in light mode, where there's only a static version.
		if (banner) banner.src = `${imgPath}five.png`;
		if (pigeon) pigeon.src = `${imgPath}pigeon.png`;
	}
}


/**
 * `setLightBackground`
 * Sets a "fancy" light background. See below to understand why.
 */
function setLightBackground() {
	// Set the "--body-background-light" CSS property. This is "none" by
	// default in the CSS file. Why? So it works better when JavaScript is
	// disabled. Let me explain. Changing the background requires JavaScript,
	// since firstly, the dark background can be animated or not, and secondly,
	// I figure out which background to use through the "dark-mode" class,
	// which gets added or removed dynamically with JavaScript. So if the page
	// doesn't load JavaScript, and the light background was already set from
	// the start, it wouldn't change in dark mode -- so you'd get dark mode
	// colors combined with a light mode background. Ew. Instead, I decided to
	// omit backgrounds altogether when JavaScript is disabled -- they're quite
	// faint anyway, so they're more than okay to replace with a solid color.
	// Okay. But now that we're executing this code, we know JavaScript is
	// enabled, so we enable the fancy backgrounds -- and the first step to
	// that end is to set the correct light background. So here it is.
	html.style.setProperty(
		"--body-background-light",
		`url("../${imgPath}tiles.png")`
	);
}


/**
 * `setNavHeights`
 * Sets the height of the expanded topnav on mobile by calculating it
 * dynamically as the number of links multiplied by its ordinary height.
 * (This wouldn't really be necessary if the topnav was directly included on
 * the page, since then it would just overlap elements below it. But since I'm
 * including it from an `<iframe>` -- so I can avoid repeating the code for it
 * on every new page -- making it taller would just make it create a scrollbar,
 * which is definitely not what I want. (By the way, the default "safe" value
 * for when the page doesn't load JavaScript is "50vh", half of the viewport
 * height. It's not guaranteed to work, but it's good enough.))
 */
function setNavHeights() {
	// If the topnav links exist:
	if (topnavLinks) {
		// Calculate `navHeightM` ("m" stands for "mobile") as the normal nav
		// height times the number of links.
		const navHeightM = navHeight * (topnavLinks.childElementCount);
		// Set the nav heights as global CSS properties, to allow the CSS file
		// to refer to them.
		html.style.setProperty("--nav-height", `${navHeight}px`);
		html.style.setProperty("--nav-height-mobile-open", `${navHeightM}px`);
	}
}


/**
 * `toggleAnimations`
 * Toggles animations on or off, depending on the value of the boolean `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleAnimations(on: boolean = !isAnimated) {
	// Update the `isAnimated` variable and save it to session storage.
	isAnimated = on;
	setSessionBool("isAnimated", isAnimated);
	// Set the "--transition-length" global CSS property to 0 if animations are
	// turned off, or to the `transitionLength` constant (200ms) otherwise.
	html.style.setProperty(
		"--transition-length",
		isAnimated ? `${transitionLength}ms` : "0"
	);
	// Set the "--body-background-dark" global CSS property to "stars.gif" if
	// animations are on, or "stars.png" otherwise -- in other words, make the
	// dark mode background animated or static, respectively.
	html.style.setProperty(
		"--body-background-dark",
		`url("../${imgPath}stars.${isAnimated ? "gif" : "png"}")`
	);
	// Update the banner and/or the pigeon, the images that react to color
	// scheme and animation changes.
	setBannerAndPigeon();
}


/**
 * `toggleBubbles`
 * Toggles bubbles on or off, depending on the value of the boolean `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleBubbles(on: boolean = !isBubbled) {
	// Update the `isBubbled` variable and save it to session storage.
	isBubbled = on;
	setSessionBool("isBubbled", isBubbled);
	// Update the visibility of all the bubbles.
	// For every SVG element with the "bubble" class...
	// (don't ask me why the type is called "SVGSVGElement")
	for (const bubble of document.querySelectorAll(".bubble")) {
		if (bubble instanceof SVGSVGElement) {
			// Toggle its visibility according to the value of `isBubbled`.
			// (Why did I even make bubbles togglable? I can see them becoming
			// a sensory issue to some folks, especially once you figure out
			// you can pop them.)
			toggleElement(bubble, isBubbled);
		}
	}
}


/**
 * `toggleTheme`
 * Toggles the theme between light or dark, depending on the value of `theme`.
 * If `theme` is omitted, the default is to truly "toggle", i.e. flip, by
 * setting it to the opposite of its previous value.
 */
function toggleTheme(theme?: ColorScheme) {
	// Update the `isDark` variable and save it to session storage.
	switch (theme) {
		case "dark":  isDark = true;  break;
		case "light": isDark = false; break;
		default:      isDark = !isDark;
	}
	setSessionBool("isDark", isDark);
	// Write the color scheme style property into the global element's style.
	// Repeat for the header and footer (since they're embedded from `<iframe>`
	// elements, they have a "root" of their own).
	const colorScheme = isDark ? "dark" : "light";
	html.style.colorScheme = colorScheme;
	if (headerHtml) headerHtml.style.colorScheme = colorScheme;
	if (footerHtml) footerHtml.style.colorScheme = colorScheme;
	// If we're in dark mode, add the "dark-mode" class to the global element
	// (and the header and footer, for the same reason.)
	if (isDark) {
		html.classList.add("dark-mode");
		if (headerHtml) headerHtml.classList.add("dark-mode");
		if (footerHtml) footerHtml.classList.add("dark-mode");
	} else {
		// Otherwise, remove that class.
		html.classList.remove("dark-mode");
		if (headerHtml) headerHtml.classList.remove("dark-mode");
		if (footerHtml) footerHtml.classList.remove("dark-mode");
	}
	// Update the banner and/or the pigeon, the images that react to color
	// scheme and animation changes.
	setBannerAndPigeon();
}


/**
 * `toggleTopnav`
 * Toggles the topnav to be expanded or contracted, depending on the value of
 * the boolean `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleTopnav(on: boolean = !isTopnavOpen) {
	isTopnavOpen = on;
	// If the topnav is now open, add the "nav-open" class to the global
	// element (and the header, for reasons explained above).
	if (isTopnavOpen) {
		html.classList.add("nav-open");
		if (headerHtml) headerHtml.classList.add("nav-open");
	} else {
		// Otherwise, remove that class.
		html.classList.remove("nav-open");
		if (headerHtml) headerHtml.classList.remove("nav-open");
	}
}


/**
 * `toggleVerbal`
 * Toggles verbal buttons on or off, depending on the value of the boolean
 * `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleVerbal(on: boolean = !isVerbal) {
	// Update the `isVerbal` variable and save it to session storage.
	isVerbal = on;
	setSessionBool("isVerbal", isVerbal);
	// If the header is loaded:
	if (headerHtml) {
		// If we've just gone verbal:
		if (isVerbal) {
			// Loop over all buttons other than the verbal button itself (which
			// always has a text label) and make them verbal.
			for (const [button, text] of [
				[animationButton, "toggle animations"],
				[bubbleButton,    "toggle bubbles"],
				[lightDarkButton, "light/dark"],
				[topnavBarButton, "menu"]
			] as const) {
				if (button) makeVerbal(button, text);
			}
		} else {
			// Otherwise, make them all nonverbal.
			// (By the way! These SVGs aren't from FontAwesome or anything; I
			// made them all myself. FontAwesome got really annoying with just
			// how many icons are paywalled, and I found I could totally just
			// make my own SVGs. You should consider it tooz! SVG is easy to
			// learn and code by hand. Give it a try! Get independent!)
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
			] as const) {
				if (button) makeNonverbal(button, src, alt);
			}
		}
	}
}


/**
 * `watchAnimations`
 * Adds an "event listener" to track when your preference for reduced motion
 * changes, and toggles animations when it does.
 */
function watchAnimations() {
	window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
		// Pass the negation of whether "prefers-reduced-motion: reduce"
		// matches. In plainspeak: if you DO prefer reduced motion, DON'T do
		// animations; if you DON'T, DO do them.
		"change", e => { toggleAnimations(!e.matches); }
	);
}


/**
 * `watchTheme`
 * Adds an "event listener" to track when your preference for dark mode
 * changes, and toggles the theme when it does.
 */
function watchTheme() {
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
		// If you prefer dark mode, pass "dark"; otherwise, pass "light".
		"change", e => { toggleTheme(e.matches ? "dark" : "light"); }
	);
}


/**
 * `main`
 * Do this once the page fully loads.
 */
function main() {
	// Get the fixed HTML elements on their page by their IDs.
	// Feed `html` and `body` through `just(...)` so that TypeScript knows for
	// sure that they exist (and aren't `null`).
	html   = just(document.querySelector("html"));
	body   = just(document.querySelector("body"));
	// Next, get the banner (on the homepage), pigeon (on the 404 page),
	// header, and footer. The type assertions here are a bit odd: basically,
	// `getElementById` always returns a `Null<HTMLElement>`, but I need a more
	// specific type than `HTMLElement` to do things later with these variables
	// without TypeScript complaining. But the result could still be `null`,
	// e.g. there is no banner on any page other than the homepage. That's
	// where these weird types on the right-hand side come from.
	banner = document.getElementById("banner")   as Null<HTMLImageElement>;
	pigeon = document.getElementById("pigeon")   as Null<HTMLImageElement>;
	header = document.getElementById("header-i") as Null<HTMLIFrameElement>;
	footer = document.getElementById("footer-i") as Null<HTMLIFrameElement>;
	// Get the bubble space, if it exists.
	bubbleSpace = document.getElementById("bubble-space");
	// Get the header and footer root, if they exist. (The `?.` operator means
	// (almost) the same as `.`, but protects against `null` values: `a?.b`
	// means `undefined` if `a` is `null` or `undefined`, otherwise, it just
	// means `a.b`. The fact that it produces `undefined`, rather than `null`,
	// is why I needed the types of all this stuff to include `undefined`.)
	headerRoot = header?.contentWindow?.document;
	footerRoot = footer?.contentWindow?.document;
	// Get elements from the header...
	headerHtml      = headerRoot?.querySelector("html");
	topnavLinks     = headerRoot?.getElementById("topnav-links");
	animationButton = headerRoot?.getElementById("animation-button");
	bubbleButton    = headerRoot?.getElementById("bubble-button");
	lightDarkButton = headerRoot?.getElementById("light-dark-button");
	topnavBarButton = headerRoot?.getElementById("topnav-bar-button");
	// ...and the footer.
	footerHtml   = footerRoot?.querySelector("html");
	verbalButton = footerRoot?.getElementById("verbal-button");
	// Finally, do all the initialization stuff.
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



/**
 * Once the page loads, run `main`.
 */

executeOnLoad(main);
