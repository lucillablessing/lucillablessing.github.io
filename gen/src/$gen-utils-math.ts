// ## Imports

import {
	renderToString,
} from "../../extern/katex/katex.js";

import {
	type HtmlString,
} from "../../scripts/ts/utils.ts";



// ## Type declarations

type RenderMode = "inline" | "display";



// ## Constants

const inlineMathRegex  = /\\\((.*?)\\\)/g;
const displayMathRegex = /\\\[(.*?)\\\]/gs;



// ## Functions

function renderMathmlExpression(s: string, mode: RenderMode): HtmlString {
	return renderToString(
		s,
		{
			output: "mathml",
			throwOnError: false,
			displayMode: mode === "display"
		}
	)
}


function renderMathml(
	s: string,
	postProcess: (
		mathml: HtmlString,
		outer:  string,
		inner:  string
	) => HtmlString = mathml => mathml
): HtmlString {
	return s.replaceAll(
		inlineMathRegex,
		(outer: string, inner: string) =>
		postProcess(renderMathmlExpression(inner, "inline"),  outer, inner)
	).replaceAll(
		displayMathRegex,
		(outer: string, inner: string) =>
		postProcess(renderMathmlExpression(inner, "display"), outer, inner)
	);
}



// ## Exports

export { renderMathml };
