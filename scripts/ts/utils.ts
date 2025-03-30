// # The Power Of Five
//   by Lucilla
//
//   `utils.ts`
//   A few basic general utilities imported by the other modules.

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



// ## Type declarations

/**
 * As per usual TypeScript fashion, we start with a few handy types.
 * The `|` operator for types means "or", and creates so-called sum types, in
 * which you can differentiate between cases.
 * `Optional`, `Null`, and `Maybe` add, respectively, `undefined`, `null`, or
 * both, to the possible values of any type T.
 * `HtmlString` and `UrlString` are just type synonyms for `string` -- they
 * mean nothing to TypeScript. I declared them just so I can annotate better
 * to myself exactly what kinds of data a string contains: HTML code, a URL,
 * or neither of the two.
 */

type Optional<T> = T | undefined;
type Null<T>     = T | null;
type Maybe<T>    = T | undefined | null;

type HtmlString = string;
type UrlString  = string;



// ## Constants

/**
 * `dataPath`, `imgPath`, and `svgPath` are self-explanatory.
 * `svgNS` is a string I need to pass to the function `createElementNS` to
 * create SVG elements. Don't ask me why.
 * `navHeight` is the height of the navbar in pixels. I need this to
 * dynamically set the height of the iframe containing the expanded dropdown
 * menu on mobile.
 * `transitionLength` is the duration of transitions in milliseconds. I set
 * this to 0 if you turn off animations or prefer reduced motion.
 */

const dataPath = "assets/data/";
const imgPath  = "assets/images/";
const svgPath  = "assets/svg/";
const svgNS    = "http://www.w3.org/2000/svg";

const navHeight        = 56;
const transitionLength = 200;



// ## Functions

/**
 * `executeOnLoad`
 * Takes a function `f` -- which itself must be a function that takes no inputs
 * and returns no outputs; in TypeScript syntax, `f` has the type `() => void`
 * -- and delegates its execution until the entire web page is fully loaded.
 */
function executeOnLoad(f: () => void) {
	// If the entire page is already fully loaded, just call `f` right away.
	if (document.readyState === "complete") {
		f();
	} else {
		// Otherwise, "listen" for the event `load`, which fires once the
		// page is fully loaded, and call `f` once it does.
		window.addEventListener("load", f);
	}
}


/**
 * `fetchJsonAndThen`
 * Retrieves data from a file at URL `path` and takes a function `processIt`
 * (which takes one input `data`, of any type, and returns nothing; in
 * TypeScript parlance, `(data: any) => void`), and delegates the function
 * until its input data, as JSON, is successfully fetched from the file.
 */
function fetchJsonAndThen(path: UrlString, processIt: (data: any) => void) {
	fetch(path).then(response => response.json()).then(processIt);
}


/**
 * `getSearchParamBool`
 * Checks whether the key `option` is included in the *search params*, which
 * are the part of the URL after the name of the HTML file, preceded by a
 * question mark, which some web pages use to store additional data; e.g.
 * ```
 * https://www.youtube.com/watch?v=_eVxHYj1HFc
 * ----------------------------- -------------
 * raw URL                       search params, here containing a single key
 *                               `v` and an associated value `_eVxHYj1HFc` (the
 *                               base64-encoded unique ID of a video)
 * ```
 * *The Power Of Five* never uses search params to store key/value pairs, only
 * keys (interpreted as boolean `true` if present and `false` if not) -- and
 * even then, only for secret (shh!) functionality. It's up to you to figure
 * out from the source code where and how they're used ;)
 * Returns `true` if the key is found and `false` if not.
 */
function getSearchParamBool(option: string): boolean {
	// Get the URL of this page.
	const url = new URL(window.location.href);
	// Check its search params for the key `option`.
	return url.searchParams.has(option);
}


/**
 * `getSessionBool`
 * Returns a boolean (true/false) value stored in session storage under the key
 * `option`, or `null` if the key is absent.
 * 
 * *Session storage* is a built-in browser functionality that lets you store
 * key/value pairs on a per-tab basis. The storage is cleared when you close
 * the tab. Websites usually use it to transfer some data between web pages.
 * This is what *The Power Of Five* does, tooz: it uses session storage to
 * "remember" settings such as dark/light mode between pages. Session storage
 * is *not* cookies: it doesn't write to any files, it disappears as soon as
 * the tab closes.
 * 
 * Unlike with search params, session storage doesn't support storing only
 * keys: you need to store both keys and values. That's good: I want to be able
 * to store explicit true/false and also "unspecified" -- if the value is
 * missing (and only then), I should supply a default value. For instance, if
 * you manually switched to either light or dark mode, I should carry it over
 * to other web pages -- only if you didn't specify *either* yourself should I
 * guess which one you want based on your browser preferences.
 * 
 * Session storage can only store key/value pairs of *strings*, so I actually
 * also need to recognize the strings "true" and "false" and "convert" them
 * into booleans.
 */
function getSessionBool(option: string): Null<boolean> {
	// If the session storage doesn't contain the pair
	// "leaderOfTheUniverse": "Lucilla", it means the values in it weren't
	// set by me; they came from another website that was in the tab earlier.
	// Unlikely, but possible. In that case, ignore the values (return `null`).
	if (sessionStorage.getItem("leaderOfTheUniverse") !== "Lucilla") {
		return null;
	}
	// We're good, the session storage is mine! Retrieve the (string!) value
	// stored under the key `option` and convert it to a boolean (or null,
	// if the key wasn't found).
	const s = sessionStorage.getItem(option);
	switch (s) {
		case "false": return false;
		case "true":  return true;
		default:      return null;
	}
}


/**
 * `just`
 * "Extracts" a "real" value of type `T` out of the type `Maybe<T>`. That is,
 * if it isn't `null` or `undefined`, return it; otherwise, throw an error.
 */
function just<T>(maybe: Maybe<T>): T {
	if (maybe !== null && maybe !== undefined) {
		return maybe;
	} else {
		throw new Error(`${maybe} is null or undefined`);
	}
}


/**
 * `randomColor`
 * Generates a random color and returns it, coded as a CSS string in the format
 * `hsl(0.5turn 50% 20%)`. The only thing being randomized, uniformly, is the
 * hue in the HSL (hue, saturation, lightness) model. The saturation and
 * lightness are both fixed, at 50% and 20%, respectively.
 * 
 * This function works because JavaScript's `Math.random` produces uniformly
 * distributed real numbers from 0 inclusive to 1 exclusive, which are exactly
 * the correct range for the CSS `turn` unit.
 * 
 * This pool of random colors was chosen because they all have sufficient
 * contrast against pure white (#ffffff) text, according to
 * [WhoCanUse](https://www.whocanuse.com).
 */
function randomColor(): string {
	return `hsl(${Math.random()}turn 50% 20%)`;
}


/**
 * `randomIntInRange`
 * Returns a random integer in the range from `a` inclusive to `b` exclusive.
 * `a` and `b` must be integers, and `a` must not be greater than `b`. The
 * distribution is uniform. This function essentially performs an affine
 * transformation of the range from 0 to 1 provided by `Math.random`.
 * 
 * Example: `randomIntInRange(3, 6)` produces `3`, `4`, or `5`, with equal
 * probability (1/3 each).
 */
function randomIntInRange(a: number, b: number): number {
	return a + Math.floor((b - a) * Math.random());
}


/**
 * `setSessionBool`
 * Takes a key `option` and a boolean (or null) `value` to store under that key
 * in session storage. This is the "opposite" of `getSessionBool`, *writing*
 * a new desired value instead of *reading* one.
 * 
 * Once again, session storage can only store strings, so I "convert" the
 * boolean into a string -- or remove the item altogether, to "store" `null`.
 */
function setSessionBool(option: string, value: Null<boolean>) {
	// If my "session storage signature" isn't present, add it, so that future
	// `getSessionBool` calls will recognize the values as mine.
	if (sessionStorage.getItem("leaderOfTheUniverse") === null) {
		sessionStorage.setItem("leaderOfTheUniverse", "Lucilla");
	}
	switch (value) {
		// Convert the boolean (or null) to a string and store it.
		case false: sessionStorage.setItem(option, "false"); return;
		case true:  sessionStorage.setItem(option, "true");  return;
		default:    sessionStorage.removeItem(option);
	}
}


/**
 * `toggleElement`
 * "Toggles" `element` on or off (depending on the value of the boolean `to`),
 * i.e. makes it visible or invisible.
 */
function toggleElement(element: HTMLElement | SVGSVGElement, to: boolean) {
	if (!to) {
		// If `to` is false, add "display: none;" to the style.
		element.style.display = "none";
	} else {
		// Otherwise, remove the "display" property from the style.
		element.style.removeProperty("display");
	}
}



// ## Exports

export {
	Optional,
	Null,
	Maybe,
	HtmlString,
	UrlString,
	dataPath,
	imgPath,
	svgPath,
	svgNS,
	navHeight,
	transitionLength,
	executeOnLoad,
	fetchJsonAndThen,
	getSearchParamBool,
	getSessionBool,
	just,
	randomColor,
	randomIntInRange,
	setSessionBool,
	toggleElement,
}
