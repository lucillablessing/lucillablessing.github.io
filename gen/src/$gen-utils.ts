// ## Imports

import {
	type Null,
	type HtmlString,
	type UrlString,
	type DateTuple,
} from "../../scripts/ts/utils.ts";



// ## Type declarations

type BlogPostHeadings  = Map<string, HtmlString>;
type BlogPostFootnotes = Map<string, HtmlString>;

type BlogPostMetadata = {
	date:     DateTuple,
	id:       string,
	title:    string,
	useMath?: boolean,
}

type BlogPostContent = {
	bodyLines:  HtmlString[],
	note?:      HtmlString,
	headings?:  BlogPostHeadings,
	footnotes?: BlogPostFootnotes,
}

type PageData = {
	name?:             string,
	code:              string,
	output?:           string,
	baseUrl?:          UrlString,
	noRender?:         boolean,
	stylePaths:        Null<UrlString>[],
	scriptPaths:       Null<UrlString>[],
	blogPostMetadata?: BlogPostMetadata,
}

type BlogJson = BlogPostMetadata[];
type PageJson = PageData[];



// ## Functions

function padPrefix(s: string, n: number, pad: string): string {
	return (pad.repeat(n) + s).slice(-n);
}


function stringGlue(r: string, ...ss: string[]): string {
	return ss.filter(s => s !== "").join(r);
}


function stringIndent(n: number, s: string): string {
	if (n === 0) return s;
	return s.split("\n").map(
		(l, i) => i === 0 ? l : "\t".repeat(n) + l
	).join("\n");
}


function stringReline(s: string): string {
	return (s.trim() + "\n").replaceAll("\r", "").replaceAll("\n", "\r\n");
}


function stringTrim(s: string): string {
	return s.trim();
}


function titleCase(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}



// ## Exports

export {
	type BlogPostHeadings,
	type BlogPostFootnotes,
	type BlogPostMetadata,
	type BlogPostContent,
	type PageData,
	type BlogJson,
	type PageJson,
	padPrefix,
	stringGlue,
	stringIndent,
	stringReline,
	stringTrim,
	titleCase,
}
