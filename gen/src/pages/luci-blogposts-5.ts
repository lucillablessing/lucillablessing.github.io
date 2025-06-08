// ## Imports

import {
	type HtmlString,
	type DateTuple,
	type Calendar,
	calendars,
	just,
} from "../../../scripts/ts/utils.ts";

import {
	type BlogPostHeadings  as BPHeadings,
	type BlogPostFootnotes as BPFootnotes,
	type BlogPostMetadata  as BPMetadata,
	type BlogPostContent   as BPContent,
	stringGlue   as G,
	stringIndent as I,
	stringTrim   as T,
} from "../$gen-utils.ts";

import {
	formatDate,
	formatDateNumeric,
} from "../$gen-utils-calendar.ts";

import {
	renderMathml,
} from "../$gen-utils-math.ts";

import {
	formatBlogTemplate,
	headingsInBodyOrder,
	footnotesInBodyOrder,
} from "../$gen-format-blog.ts";



// ## Functions

const dateInCalendarHtml = (date: DateTuple, calendar: Calendar) => /*html*/`
<time ${
	G(" ",
		`class="date-${calendar}"`,
		calendar !== "gregorian" ? 'style="display: none;"' : ""
	)
} datetime="${
	formatDateNumeric(date)
}">${
	G(
		" ",
		formatDate(date, calendar).match(/\bof\b/) ? "the" : "",
		formatDate(date, calendar).replace(
			/(?<=\d+)[a-z]+(?=\b)/,
			/*html*/`<sup>$&</sup>`
		)
	)
}</time>
`;


const dateHtml = (date: DateTuple) => /*html*/`
<p class="date">Posted on ${
	calendars.map(
		calendar => T(dateInCalendarHtml(date, calendar))
	).join("")
}</p>
`;


const introHtml = (content: BPContent, metadata: BPMetadata) => /*html*/`
<section id="blog-post-intro">
	<h1 id="title">${metadata.title}</h1>
	${
		I(1,
			G("\n",
				T(dateHtml(metadata.date)),
				content.note ?
				/*html*/`<p class="note">${content.note}</p>` :
				""
			)
		)
	}
	<p class="back-to-blog"><a href="../blog.html">(back to blög)</a></p>
</section>
`;


const contentsItemHtml = (name: string, heading: HtmlString) => /*html*/`
<li><a href="#${name}">${heading}</a></li>
`;


const contentsListHtml = (
	content:  BPContent,
	headings: BPHeadings
) => /*html*/`
<ul>
	<li><a href="#">(home)</a></li>
	${
		I(1,
			headingsInBodyOrder(content).map<[string, HtmlString]>(
				name => [name, just(headings.get(name))]
			).concat(
				content.footnotes ? [["footnotes", "(footnotes)"]] : []
			).map(
				([headingName, heading]) =>
				T(contentsItemHtml(headingName, heading))
			).join("\n")
		)
	}
</ul>
`;


const contentsSectionHtml = (
	content:  BPContent,
	headings: BPHeadings
) => /*html*/`
<hr>
<aside id="blog-post-contents">
	<div id="contents-container">
		<h2>Contents</h2>
		${I(2, T(contentsListHtml(content, headings)))}
	</div>
</aside>
`;


const contentsHtml = (content: BPContent) => /*html*/`${
	content.headings ?
	T(contentsSectionHtml(content, content.headings)) :
	/*html*/`<hr>`
}`;


const footnotesItemHtml = (name: string, footnote: HtmlString) => /*html*/`
<li id="footnote-${name}">
	${I(1, footnote)}
	<a class="back" href="#${
		name
	}" title="back to text" aria-label="back to text">${
		"\u21a9"
	}</a>
</li>
`;


const footnotesListHtml = (
	content:   BPContent,
	footnotes: BPFootnotes
) => /*html*/`
<ol>
	${
		I(1,
			footnotesInBodyOrder(content).map<[string, HtmlString]>(
				name => [name, just(footnotes.get(name))]
			).map(
				([footnoteName, footnote]) =>
				T(footnotesItemHtml(footnoteName, footnote))
			).join("\n")
		)
	}
</ol>
`;


const footnotesSectionHtml = (
	content:   BPContent,
	footnotes: BPFootnotes
) => /*html*/`
<hr id="end-of-body">
<section id="blog-post-footnotes">
	<h2 id="footnotes">Footnotes</h2>
	${I(1, T(footnotesListHtml(content, footnotes)))}
</section>
<hr>
`;


const footnotesHtml = (content: BPContent) => /*html*/`${
	content.footnotes ?
	T(footnotesSectionHtml(content, content.footnotes)) :
	/*html*/`<hr>`
}`;


const headingHtml = (name: string, heading: HtmlString) => /*html*/`
<h2 id="${
	name
}">${
	heading
} <a class="home" href="#" title="back to top" aria-label="back to top">${
	"\u21a5"
}</a></h2>
`;


const footnoteHtml = (footnoteName: string) => /*html*/`
<a id="${
	footnoteName
}" class="footnote" href="#footnote-${
	footnoteName
}" title="jump to footnote"><span class="visua11y-hidden">jump to footnote</span></a>
`;


const actualBodyHtml = (content: BPContent) => /*html*/`
<section id="blog-post-body">
	${I(1, T(formatBlogTemplate(content, headingHtml, footnoteHtml)))}
</section>
`;


const mathHtml = (mathml: HtmlString, source: string) => /*html*/`
<span class="m">${source}</span>${mathml}
`;


const blogPostUnprocessedBodyHtml = (content: BPContent, metadata: BPMetadata) => /*html*/`
<main ${
	G(
		" ",
		'id="main"',
		metadata.useMath ? "data-luci-math" : ""
	)
}>
	<div class="box wide blog-post">
		${I(2, T(introHtml(content, metadata)))}
		${I(2, T(contentsHtml(content)))}
		${I(2, T(actualBodyHtml(content)))}
		${I(2, T(footnotesHtml(content)))}
		<p class="back-to-top">(<a href="#">back to top</a>)</p>
	</div>
</main>
`;


const blogPostMathProcessedBodyHtml = (
	content:  BPContent,
	metadata: BPMetadata
) => /*html*/`${
	renderMathml(
		blogPostUnprocessedBodyHtml(content, metadata),
		(mathml, outer) => T(
			mathHtml(
				mathml
				.replaceAll(/<span class="katex">(.*?)<\/span>/g, "$1")
				.replaceAll(/<annotation(?:.*?)<\/annotation>/gs, "")
				.replaceAll(/math xmlns=".*?"/g, "math"),
				outer
			)
		)
	)
}`;


const blogPostBodyHtml = (
	content:  BPContent,
	metadata: BPMetadata
) => /*html*/`${
	T(
		metadata.useMath ?
		blogPostMathProcessedBodyHtml(content, metadata) :
		blogPostUnprocessedBodyHtml(content, metadata)
	)
}`;



// ## Exports

export default blogPostBodyHtml;
