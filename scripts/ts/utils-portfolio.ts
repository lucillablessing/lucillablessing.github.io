// # The Power Of Five
//   by Lucilla
//
//   `utils-portfolio.ts`
//   Utilities for managing the project and writing pages.

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
	type HtmlString,
	type UrlString,
	type DateTuple,
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
 * First we have six types derived from the constant arrays above; this is a
 * really cool trick I learned from
 * [this StackOverflow post](https://stackoverflow.com/a/58504957).
 * Next are `ProjectTag` and `ProjectThumb`, some simple type aliases.
 * Next is `ProjectLink`, an object with keys `a` and `href`, holding the link
 * text and the URL for a link, respectively.
 * Next is `Project`, with too many fields to explain here; most are optional.
 * See below for an explanation of all the fields.
 * Finally, `ProjectJson` is an array of `Project`s. This is the type of the
 * data structure saved in `projects.json` used to generate the project
 * portfolios.
 */

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
	date?:             DateTuple,     // Date when a project was published.
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
	thumbnail?:        ProjectThumb,  // Thumbnail URL.
	thumbnailLabel?:   Null<string>,  // Non-default label text for the
	                                  // thumbnail, for when the default is
	                                  // ungrammatical or unfitting; or `null`
									  // to avoid label text altogether.
	tags:              ProjectTag[],  // Tag list ("ordered set"). Mandatory.
	writingTags?:      WritingTagX[], // List of writing-related tags.
};

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



// ## Exports

export {
	type ProjectTagPrimary,
	type ProjectTagSecondary,
	type WritingTag,
	type ProjectTagPrimaryX,
	type ProjectTagSecondaryX,
	type WritingTagX,
	type DateTuple,
	type ProjectLink,
	type Project,
	type ProjectJson,
	primaryFilters,
	secondaryFilters,
	writingFilters,
	isProjectTagPrimary,
	isProjectTagSecondary,
	isWritingTag,
	isProjectTagPrimaryX,
	isProjectTagSecondaryX,
	isWritingTagX,
}
