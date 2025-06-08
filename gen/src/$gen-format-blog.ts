// ## Imports

import {
	type HtmlString,
	just,
} from "../../scripts/ts/utils.ts";

import {
	type BlogPostContent,
	stringTrim as T,
} from "./$gen-utils.ts";



// ## Constants

const headingInsertionRegex  = /<!--\${heading\.([a-z-]+)}-->/g;
const footnoteInsertionRegex = /<!--\${footnote\.([a-z-]+)}-->/g;



// ## Functions

function formatError(message: string, lineNumber?: number): never {
	if (lineNumber === undefined) throw new Error(
		`Format error: ${message}`
	); else throw new Error(
		`Format error at line ${lineNumber}: ${message}`
	);
}


function formatAssert(v: any, message: string, lineNumber?: number) {
	if (!v) formatError(message, lineNumber);
}


function findHeading(
	headingName: string,
	content:     BlogPostContent,
	lineNumber:  number
): HtmlString {
	formatAssert(
		content.headings &&
		content.headings.has(headingName),
		`undeclared heading "${headingName}"`,
		lineNumber
	);
	return just(just(content.headings).get(headingName));
}


function findFootnote(
	footnoteName: string,
	content:      BlogPostContent,
	lineNumber:   number
) {
	formatAssert(
		content.footnotes &&
		content.footnotes.has(footnoteName),
		`undeclared heading "${footnoteName}"`,
		lineNumber
	);
	return just(just(content.footnotes).get(footnoteName));
}


function formatBlogTemplate(
	content: BlogPostContent,
	headingFormatter:  (name: string, heading: HtmlString)  => HtmlString,
	footnoteFormatter: (name: string, footnote: HtmlString) => HtmlString
): HtmlString {
	const bodyLines = content.bodyLines;
	return (
		bodyLines.map(
			(line, i) =>
			line.replaceAll(
				headingInsertionRegex,
				(_: string, headingName: string) =>
				T(
					headingFormatter(
						headingName,
						findHeading(headingName, content, i + 1)
					)
				)
			).replaceAll(
				footnoteInsertionRegex,
				(_: string, footnoteName: string) =>
				T(
					footnoteFormatter(
						footnoteName,
						findFootnote(footnoteName, content, i + 1)
					)
				)
			)
		).join("\n")
	);
}


function headingsInBodyOrder(content: BlogPostContent): string[] {
	const bodyLines = content.bodyLines;
	let headings: string[] = [];
	let matches:  RegExpStringIterator<RegExpExecArray>;
	bodyLines.forEach(
		(line, i) => {
			matches = line.matchAll(headingInsertionRegex);
			for (const m of matches) {
				const heading = m[1];
				formatAssert(
					!headings.includes(heading),
					`heading "${heading}" appears more than once`,
					i + 1
				);
				headings.push(heading);
			}
		}
	);
	return headings;
}


function footnotesInBodyOrder(content: BlogPostContent): string[] {
	const bodyLines = content.bodyLines;
	let footnotes: string[] = [];
	let matches:   RegExpStringIterator<RegExpExecArray>;
	bodyLines.forEach(
		(line, i) => {
			matches = line.matchAll(footnoteInsertionRegex);
			for (const m of matches) {
				const footnote = m[1];
				formatAssert(
					!footnotes.includes(footnote),
					`footnote "${footnote}" appears more than once`,
					i + 1
				);
				footnotes.push(footnote);
			}
		}
	);
	return footnotes;
}



// ## Exports

export {
	formatBlogTemplate,
	headingsInBodyOrder,
	footnotesInBodyOrder,
}
