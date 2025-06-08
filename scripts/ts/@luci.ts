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
	type Null,
	type UrlString,
	type Calendar,
	imgPath,
	svgPath,
	svgNS,
	navHeight,
	transitionLength,
	calendars,
	isCalendar,
	executeOnLoad,
	getSessionBool,
	getSessionCalendar,
	just,
	randomIntInRange,
	setSessionBool,
	setSessionCalendar,
	toggleElement,
} from "./utils.ts";



// ## Type declarations

/**
 * This section just has two simple enum types: `ColorScheme` and `Direction`.
 * They're both pretty self-explanatory.
 */

type ColorScheme       = "dark"    | "light";
type Direction         = "left"    | "right";
// type Dimension      = "width"   | "height";
// type LuciSuperpower = "zashing" | "flight";



// ## Global variables

/**
 * To begin with, there's a gigantic number of global variables for HTML
 * elements, all of which we'll attempt to get from the document by their IDs.
 * Not all will exist on every page; the ones that might not are marked with a
 * `Null<...>` type.
 * 
 * Next, we have five boolean variables that control global toggles for the
 * site: `isBubbled` whether bubbles are visible, `isDark` whether the site is
 * in dark mode, `isAnimated` whether animations are on, `isVerbal` whether
 * buttons should display words instead of icons, and `isTopnavOpen` whether
 * the dropdown menu on mobile is open. Only `isTopnavOpen` gets initialized;
 * the remaining variables will first attempt to get their values from session
 * storage, so they can carry over from the previous page.
 * 
 * Finally, we have a variable for the active calendar. It, tooz, doesn't get
 * initialized, because we get its value from session storage.
 * 
 * Many of the functions here read and write these global variables directly,
 * rather than taking them as arguments or returning them. It makes their
 * signatures quite a bit simpler, even if the clarity of the code suffers a
 * tiny bit as a result.
 */

let html:             HTMLElement;
let body:             HTMLElement;
let banner:           Null<HTMLImageElement>;
let pigeon:           Null<HTMLImageElement>;
let header:           Null<HTMLIFrameElement>;
let footer:           Null<HTMLIFrameElement>;
let bubbleSpace:      Null<HTMLElement>;
let calendarFieldset: Null<HTMLFieldSetElement>;
let headerRoot:       Null<Document>;
let footerRoot:       Null<Document>;
let headerHtml:       Null<HTMLElement>;
let footerHtml:       Null<HTMLElement>;
let topnavLinks:      Null<HTMLElement>;
let animationButton:  Null<HTMLElement>;
let bubbleButton:     Null<HTMLElement>;
let lightDarkButton:  Null<HTMLElement>;
let topnavBarButton:  Null<HTMLElement>;
let verbalButton:     Null<HTMLElement>;

let isBubbled:    boolean;
let isDark:       boolean;
let isAnimated:   boolean;
let isVerbal:     boolean;
let isTopnavOpen: boolean = false;

let activeCalendar: Calendar;



// ## Functions


/**
 * Fetch a Calendar from session storage and also update the calendar selection
 * widget, if one is present on the page, to have that one preselected.
 */
function getCalendar(): void {
	// If no Calendar is saved in session storage, default to Gregorian.
	// We wouldn't want to confuse anyone with the Blessing calendar.
	// It's meant to be just for fun.
	activeCalendar = getSessionCalendar("calendar") ?? "gregorian";
	// If this page has a calendar selection widget, make it visible. That's
	// because they should be *in*visible by default, since they don't do
	// anything without JavaScript; they should only become visible once we
	// know for sure that JavaScript is active, and wouldn't you know it, we
	// know that by the fact that we're executing this code.
	if (calendarFieldset) {
		toggleElement(calendarFieldset, true);
		// Make the widget preselect the calendar we just got from session
		// storage.
		for (const control of calendarFieldset.children) {
			if (control instanceof HTMLInputElement) {
				const calendar = control.getAttribute("data-luci-calendar");
				control.checked = calendar === activeCalendar;
			}
		}
	}
}


/**
 * Initialize the four global toggles (all but `isTopnavOpen`), by first trying
 * to fetch them from session storage, and if they're not found there, giving
 * them sensible default values.
 */
function getOptions(): void {
	// If `isDark` isn't found in session storage, set it to whether the
	// browser prefers dark color schemes.
	isDark = (
		getSessionBool("isDark") ??
		window.matchMedia("(prefers-color-scheme: dark)").matches
	);
	// If `isAnimated` isn't found in session storage, set it to whether the
	// browser DOESN'T prefer reduced motion. (It makes sense.)
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
 * @param bubbleSpace     - HTML element housing the bubbles.
 * @param bubbleSpaceSize - Approximate percentage of the viewport width.
 * @param direction       - Screen half to make the bubble in.
 * 
 * Makes a bubble on the side of the screen, anywhere within the specified
 * `bubbleSpaceSize` (roughly speaking, a percentage of the viewport width; see
 * the function `makeBubbles` below for specifics) and in the specified
 * `direction` (either "left" or "right").
 */
function makeBubble(
	bubbleSpace:     HTMLElement,
	bubbleSpaceSize: number,
	direction:       Direction
): void {
	// Make a bubble!
	const svg    = document.createElementNS(svgNS, "svg");
	const circle = document.createElementNS(svgNS, "circle");
	svg.appendChild(circle);
	svg.classList.add("bubble");
	// Give it a random diameter between 32px and 192px.
	const bubbleSize = randomIntInRange(32, 192);
	svg.setAttribute("width", bubbleSize.toString());
	svg.setAttribute("height", bubbleSize.toString());
	// Make it pop itself when clicked.
	svg.onclick = () => { popBubble(svg); };
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


/**
 * Populates the "bubble space" with bubbles.
 */
function makeBubbles(): void {
	if (bubbleSpace) {
		// Choose how many left and right bubbles to generate: 1, 2, 3, or 4.
		const numberOfLeftBubbles  = randomIntInRange(1, 5);
		const numberOfRightBubbles = randomIntInRange(1, 5);
		// Get the 'size' of the bubble space from the "data-luci-size"
		// attribute. ("data" is a prefix for custom attributes; "luci" is
		// another prefix I use for those that I defined.) It's stored as a
		// string, so I need to convert it to a number. If it wasn't found,
		// choose 10 as a default.
		// The "size" is a percentage of the viewport width, and specifies how
		// far from the left or right border a bubble can spawn. For instance,
		// a size of 10 means bubbles can only spawn in the leftmost 10% or the
		// rightmost 10% of the viewport (roughly).
		const bubbleSpaceSize = Number(
			bubbleSpace.getAttribute("data-luci-size") ?? 10
		);
		// Make the left and right bubbles by calling `makeBubble` n times,
		// where n = `numberOfLeftBubbles` or `numberOfRightBubbles`.
		// (Why am I passing the bubble space itself as an argument to
		// `makeBubble`, when it's a global variable? This is a neat trick to
		// help TypeScript renember that `bubbleSpace` isn't null even "within"
		// a nested function.)
		for (let i = 0; i < numberOfLeftBubbles; i++) {
			makeBubble(bubbleSpace, bubbleSpaceSize, "left");
		}
		for (let i = 0; i < numberOfRightBubbles; i++) {
			makeBubble(bubbleSpace, bubbleSpaceSize, "right");
		}
	}
}


/**
 * Gives the toggle buttons "event listeners", that is, makes them responsive
 * to click events by calling functions when they're clicked.
 */
function makeButtonListeners(): void {
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
			// to 0, since some of these functions have optional arguments, and
			// JavaScript would try to force the ClickEvent into there.)
			"click", () => { onClick(); }
		);
	}
}


/**
 * Makes the buttons visible.
 */
function makeButtonsVisible(): void {
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
 * Gives the calendar widget, if any, "event listeners".
 */
function makeCalendarWidgetListeners(): void {
	if (calendarFieldset) {
		for (const control of calendarFieldset.children) {
			if (control instanceof HTMLInputElement) {
				control.addEventListener("change", setCalendar);
			}
		}
	}
}


/**
 * @param button - Button to make verbal.
 * @param text   - Text the button should display when verbal.
 * 
 * Makes the `button` verbal (so it displays `text` rather than an SVG icon).
 */
function makeVerbal(button: HTMLElement, text: string): void {
	button.ariaLabel   = null;
	button.textContent = text;
}


/**
 * @param button - Button to make nonverbal.
 * @param src    - Source of SVG icon to display in the button.
 * @param alt    - Alt text for the SVG icon.
 * 
 * Makes the `button` nonverbal (so it displays an SVG icon at path `src` with
 * label `alt`, rather than text).
 */
function makeNonverbal(
	button: HTMLElement, src: UrlString, alt: string
): void {
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
 * @param bubble - Bubble to pop.
 * 
 * Pops `bubble`.
 */
function popBubble(bubble: SVGSVGElement): void {
	// Add "popped" to the classes of `bubble`. CSS transitions do the rest.
	// (This is just one statement, but in case I was going to add
	// more, I put it in its own function.)
	bubble.classList.add("popped");
}


/**
 * Changes the "active" link in the topnav to be the current page.
 */
function setActiveLink(): void {
	// (I *could* do this manually on a per-page basis, but that would require
	// me to repeat the topnav code in every html file except for the active
	// link being different each time. I embed the topnav through an `<iframe>`
	// instead, specifically so I can avoid this repetition, which means I need
	// to adjust it dynamically using this function. (This behavior might
	// change in the future, since I already set up some pages to use a kind of
	// custom-coded static site generation.))
	if (topnavLinks) {
		// Firstly, make the topnav links all inactive.
		for (const link of topnavLinks.querySelectorAll("a")) {
			link.classList.remove("active");
		}
		// Figure out what page we're on, by getting it from the
		// "data-luci-page" attribute of the `<body>` element.
		const currentPage = body.getAttribute("data-luci-page");
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
					// can quit the function.
					return;
				}
			}
		}
	}
}


/**
 * Updates the banner and pigeon image sources dynamically, when the toggles
 * for dark mode and animations change.
 */
function setBannerAndPigeon(): void {
	// The website banner appears on the homepage (`index.html`), and an image
	// of a pigeon appears on the "not found" page (`404.html`). They're both
	// static in light mode, but can have animations in dark mode, which can be
	// turned off.
	if (isDark) {
		// If we're in dark mode, then the images have a static version and an
		// animated one. Choose which one to apply. The file names are
		// identical, except that the static one is a png and the animated one
		// is a gif.
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
 * Updates the `activeCalendar` global variable to match a calendar selection
 * widget, whenever its state changes. Also update any dates in the text to
 * display their dates in the correct format (which is the whole point of the
 * calendar selection widget).
 */
function setCalendar(): void {
	if (calendarFieldset) {
		for (const control of calendarFieldset.children) {
			if (control instanceof HTMLInputElement && control.checked) {
				const calendar = control.getAttribute("data-luci-calendar");
				if (calendar && isCalendar(calendar)) {
					// If an `<input>` for configuring a calendar is checked,
					// then after some sanity checks, assign the activeCalendar
					// global variable to it and save it to session storage.
					// There can be at most one such `<input>`, so break out of
					// the loop.
					activeCalendar = calendar;
					setSessionCalendar("calendar", activeCalendar);
					break;
				}
			}
		}
	}
	for (const calendar of calendars) {
		// Look for elements with a class named "date-<calendar name>" and make
		// sure that they're visible iff <calendar name> equals the currently
		// active calendar.
		for (const date of body.querySelectorAll(`.date-${calendar}`)) {
			if (date instanceof HTMLElement) {
				toggleElement(date, calendar === activeCalendar);
			}
		}
	}
}


/**
 * Sets a "fancy" light background.
 */
function setLightBackground(): void {
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
 * Sets the height of the expanded topnav on mobile by calculating it
 * dynamically as the number of links multiplied by its ordinary height.
 */
function setNavHeights(): void {
	// (This wouldn't really be necessary if the topnav was directly included
	// on the page, since then it would just overlap with elements below it.
	// But since I'm including it from an `<iframe>` -- so I can avoid
	// repeating the code for it on every new page -- making it taller would
	// just make it create a scrollbar, which is definitely not what I want.
	// (By the way, the default "safe" value for when the page doesn't load
	// JavaScript is "50vh", half of the viewport height. It's not guaranteed
	// to work, but it's good enough.))
	if (topnavLinks) {
		// Calculate `navHeightM` ("m" stands for "mobile").
		const navHeightM = navHeight * (topnavLinks.childElementCount);
		// Set the nav heights as global CSS properties, to allow the CSS file
		// to refer to them.
		html.style.setProperty("--nav-height", `${navHeight}px`);
		html.style.setProperty("--nav-height-mobile-open", `${navHeightM}px`);
	}
}


/**
 * @param on - State to toggle animations to.
 * 
 * Toggles animations on or off, depending on the value of the boolean `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleAnimations(on: boolean = !isAnimated): void {
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
 * @param on - State to toggle bubbles to.
 * 
 * Toggles bubbles on or off, depending on the value of the boolean `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleBubbles(on: boolean = !isBubbled): void {
	// Update the `isBubbled` variable and save it to session storage.
	isBubbled = on;
	setSessionBool("isBubbled", isBubbled);
	// Update the visibility of all the bubbles.
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
 * @param theme - Theme to toggle to.
 * 
 * Toggles the theme between light or dark, depending on the value of `theme`.
 * If `theme` is omitted, the default is to truly "toggle", i.e. flip, by
 * setting it to the opposite of its previous value.
 */
function toggleTheme(theme?: ColorScheme): void {
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
	// (and the header and footer, for the same reason).
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
 * @param on - State to toggle the topnav to.
 * 
 * Toggles the topnav to be expanded or contracted, depending on the value of
 * the boolean `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleTopnav(on: boolean = !isTopnavOpen): void {
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
 * @param on - State to toggle verbal buttons to.
 * 
 * Toggles verbal buttons on or off, depending on the value of the boolean
 * `on`.
 * If `on` is omitted, the default is to truly "toggle", i.e. flip, by setting
 * it to the opposite of its previous value.
 */
function toggleVerbal(on: boolean = !isVerbal): void {
	// Update the `isVerbal` variable and save it to session storage.
	isVerbal = on;
	setSessionBool("isVerbal", isVerbal);
	if (headerHtml) {
		if (isVerbal) {
			// If we've just gone verbal:
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
 * Adds an "event listener" to track when your preference for reduced motion
 * changes, and toggles animations when it does.
 */
function watchAnimations(): void {
	window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
		"change", e => { toggleAnimations(!e.matches); }
	);
}


/**
 * Adds an "event listener" to track when your preference for dark mode
 * changes, and toggles the theme when it does.
 */
function watchTheme(): void {
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
		"change", e => { toggleTheme(e.matches ? "dark" : "light"); }
	);
}


/**
 * Do this once the page fully loads.
 */
function main(): void {
	// Get the fixed HTML elements on their page by their IDs.
	// Feed `html` and `body` through `just(...)` so that TypeScript knows for
	// sure that they exist (and aren't `null`).
	html   = just(document.querySelector("html"));
	body   = just(document.querySelector("body"));
	// Next, get the banner (on the homepage), pigeon (on the 404 page),
	// header, footer, calendar fieldset (on the blog page), and bubble space.
	// I can't quite just use `getElementById`, I need more specific types than
	// just `HTMLElement` in some cases.
	let _: Null<HTMLElement>;
	bubbleSpace = document.getElementById("bubble-space");
	banner = (
		_ = document.getElementById("banner")
	) instanceof HTMLImageElement    ? _ : null;
	pigeon = (
		_ = document.getElementById("pigeon")
	) instanceof HTMLImageElement    ? _ : null;
	header = (
		_ = document.getElementById("header-i")
	) instanceof HTMLIFrameElement   ? _ : null;
	footer = (
		_ = document.getElementById("footer-i")
	) instanceof HTMLIFrameElement   ? _ : null;
	calendarFieldset = (
		_ = document.getElementById("calendar-selection")
	) instanceof HTMLFieldSetElement ? _ : null;
	// Get the header and footer root, if they exist.
	headerRoot = header?.contentWindow?.document ?? null;
	footerRoot = footer?.contentWindow?.document ?? null;
	// Get elements from the header...
	headerHtml      = headerRoot?.querySelector("html")               ?? null;
	topnavLinks     = headerRoot?.getElementById("topnav-links")      ?? null;
	animationButton = headerRoot?.getElementById("animation-button")  ?? null;
	bubbleButton    = headerRoot?.getElementById("bubble-button")     ?? null;
	lightDarkButton = headerRoot?.getElementById("light-dark-button") ?? null;
	topnavBarButton = headerRoot?.getElementById("topnav-bar-button") ?? null;
	// ...and the footer.
	footerHtml   = footerRoot?.querySelector("html")                  ?? null;
	verbalButton = footerRoot?.getElementById("verbal-button")        ?? null;
	// Finally, do all the initialization stuff.
	getCalendar();
	getOptions();
	makeBubbles();
	makeButtonListeners();
	makeButtonsVisible();
	makeCalendarWidgetListeners();
	setActiveLink();
	setCalendar();
	setLightBackground();
	setNavHeights();
	toggleAnimations(isAnimated);
	toggleTheme(isDark ? "dark" : "light");
	toggleVerbal(isVerbal);
	watchAnimations();
	watchTheme();
}



// ## Top level code

executeOnLoad(main);
