// ## Imports

import {
	type HtmlString,
	type Null,
	just,
} from "../../scripts/ts/utils.ts";

import {
	type BlogPostContent,
} from "./$gen-utils.ts";



// ## Type declarations

type BlogParseContext = "root" | "body" | "note" | "heading" | "footnote";



// ## Constants

const endMarker           = "<!---->";
const startMarkerRegex    = /<!--%{(.*?)}-->/;
const bodyMarker          = "<!--%{body}-->";
const noteMarker          = "<!--%{note}-->";
const headingMarkerRegex  = /^<!--%{heading\.([a-z-]+)}-->$/;
const footnoteMarkerRegex = /^<!--%{footnote\.([a-z-]+)}-->$/;



// ## Functions

function parseError(message: string, lineNumber?: number): never {
	if (lineNumber === undefined) throw new Error(
		`Parse error: ${message}`
	); else throw new Error(
		`Parse error at line ${lineNumber}: ${message}`
	);
}


function parseAssert(v: any, message: string, lineNumber?: number) {
	if (!v) parseError(message, lineNumber);
}


function parseBlogTemplate(blogTemplate: HtmlString): BlogPostContent {
	const lines = blogTemplate.replaceAll("\r", "").split("\n");

	let parseContext: BlogParseContext = "root";

	let heading:  string = "";
	let footnote: string = "";

	let m: Null<RegExpMatchArray>;

	let bodyLines: Null<HtmlString[]> = null;
	let noteLines: Null<HtmlString[]> = null;

	let headingLineses:  Map<string, HtmlString[]> = new Map();
	let footnoteLineses: Map<string, HtmlString[]> = new Map();

	let lineNumber: number = 0;

	loop: for (const line of lines) {
		lineNumber++;
		if (line === "") continue loop;
		switch (parseContext as BlogParseContext) {
			case "root":
			switch (line) {
				case bodyMarker: {
					parseAssert(
						bodyLines === null,
						"multiple declarations of body",
						lineNumber
					);
					parseContext = "body";
					bodyLines = [];
					continue loop;
				}
				case noteMarker: {
					parseAssert(
						noteLines === null,
						"multiple declarations of note",
						lineNumber
					);
					parseContext = "note";
					noteLines = [];
					continue loop;
				}
				default: {
					if (m = line.match(headingMarkerRegex)) {
						heading = m[1];
						parseAssert(
							!headingLineses.has(heading),
							`multiple declarations of heading ${heading}`,
							lineNumber
						);
						parseContext = "heading";
						headingLineses.set(heading, []);
						continue loop;
					} else if (m = line.match(footnoteMarkerRegex)) {
						footnote = m[1];
						parseAssert(
							!footnoteLineses.has(footnote),
							`multiple declarations of footnote ${footnote}`,
							lineNumber
						);
						parseContext = "footnote";
						footnoteLineses.set(footnote, []);
						continue loop;
					} else parseError(
						`unrecognized top-level line: "${line}"`,
						lineNumber
					);
				}
			}
			case "body":
			switch (line) {
				case endMarker: {
					parseContext = "root";
					continue loop;
				}
				default: {
					parseAssert(
						!line.match(startMarkerRegex),
						`unrecognized directive in body: "${line}"`,
						lineNumber
					);
					just(bodyLines).push(line);
					continue loop;
				}
			}
			case "note":
			switch (line) {
				case endMarker: {
					parseContext = "root";
					continue loop;
				}
				default: {
					parseAssert(
						!line.match(startMarkerRegex),
						`unrecognized directive in note: "${line}"`,
						lineNumber
					)
					just(noteLines).push(line);
					continue loop;
				}
			}
			case "heading":
			switch (line) {
				case endMarker: {
					heading = "";
					parseContext = "root";
					continue loop;
				}
				default: {
					if (m = line.match(headingMarkerRegex)) {
						heading = m[1];
						parseAssert(
							!headingLineses.has(heading),
							`multiple declarations of heading ${heading}`,
							lineNumber
						);
						headingLineses.set(heading, []);
						continue loop;
					} else {
						parseAssert(
							!line.match(startMarkerRegex),
							`unrecognized directive in heading: "${line}"`,
							lineNumber
						)
						const headingLines = headingLineses.get(heading);
						just(headingLines).push(line);
						continue loop;
					}
				}
			}
			case "footnote":
			switch (line) {
				case endMarker: {
					footnote = "";
					parseContext = "root";
					continue loop;
				}
				default: {
					if (m = line.match(footnoteMarkerRegex)) {
						footnote = m[1];
						parseAssert(
							!footnoteLineses.has(footnote),
							`multiple declarations of footnote ${footnote}`,
							lineNumber
						);
						footnoteLineses.set(footnote, []);
						continue loop;
					} else {
						parseAssert(
							!line.match(startMarkerRegex),
							`unrecognized directive in footnote: "${line}"`,
							lineNumber
						)
						const footnoteLines = footnoteLineses.get(footnote);
						just(footnoteLines).push(line);
						continue loop;
					}
				}
			}
		}
	}

	parseAssert(bodyLines && bodyLines.length > 0, "empty body");

	const note = (
		!noteLines || noteLines.length === 0 ?
		undefined :
		noteLines.join("\r\n")
	);

	const headings = headingLineses.size === 0 ? undefined : new Map(
		Array.from(headingLineses.entries()).map(
			([heading, headingLines]) =>
			[heading, headingLines.join("\r\n")]
		)
	);

	const footnotes = footnoteLineses.size === 0 ? undefined : new Map(
		Array.from(footnoteLineses.entries()).map(
			([footnote, footnoteLines]) =>
			[footnote, footnoteLines.join("\r\n")]
		)
	);

	return {
		bodyLines: just(bodyLines),
		note,
		headings,
		footnotes
	};
}



// ## Exports

export { parseBlogTemplate };
