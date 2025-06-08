// ## Imports

import {
	type DateTuple,
	type Calendar,
	calendars,
} from "../../../scripts/ts/utils.ts";

import {
	type BlogPostMetadata,
	type BlogJson,
	stringGlue   as G,
	stringIndent as I,
	stringTrim   as T,
	titleCase,
} from "../$gen-utils.ts";

import {
	formatDate,
	formatDateNumeric,
} from "../$gen-utils-calendar.ts";



// ## Functions

const blogCalendarChoiceHtml = (
	calendar: Calendar,
	isFirst:  boolean,
	isLast:   boolean
) => /*html*/`
<input ${
	G(" ",
		`id="calendar-${calendar}"`,
		isFirst ? 'class="blog-radio-first"' :
		isLast  ? 'class="blog-radio-last"'  :
		"",
		'type="radio"',
		'name="calendar-selection"',
		`data-luci-calendar="${calendar}"`,
		calendar === "gregorian" ? "checked" : ""
	)
}>
<label for="calendar-${calendar}">${titleCase(calendar)}</label>
`;


const blogControlsHtml = () => /*html*/`
<section id="blog-controls">
	<fieldset id="calendar-selection" style="display: none;">
		<legend>calendar:</legend>
		${
			I(2,
				calendars.map(
					(calendar, i) =>
					T(
						blogCalendarChoiceHtml(
							calendar,
							i === 0,
							i === calendars.length - 1
						)
					)
				).join("\n")
			)
		}
	</fieldset>
</section>
`;


const blogDateInCalendarHtml = (
	date:     DateTuple,
	calendar: Calendar
) => /*html*/`
<time ${
	G(" ",
		`class="date-${calendar}"`,
		calendar !== "gregorian" ? 'style="display: none;"' : ""
	)
} datetime="${
	formatDateNumeric(date)
}">${
	formatDate(date, calendar).replace(
		/(?<=\d+)[a-z]+(?=\b)/,
		/*html*/`<sup>$&</sup>`
	)
}</time>
`;


const blogHistoryEntryHtml = (metadata: BlogPostMetadata) => /*html*/`
<article>
	<small class="date-published">
		${
			I(2,
				calendars.map(
					calendar =>
					T(blogDateInCalendarHtml(metadata.date, calendar))
				).join("\n")
			)
		}
	</small>
	<h2><a href="blog/${metadata.id}.html">${metadata.title}</a></h2>
</article>
`;


const blogHistoryHtml = (json: BlogJson) => /*html*/`
<section id="blog-history">
${
	I(1,
		json.map(
			metadata => T(blogHistoryEntryHtml(metadata))
		).join("\n")
	)
}
</section>
`;


const blogBodyHtml = (json: BlogJson) => /*html*/`
<main id="main">
	<div id="bubble-space" aria-hidden="true" data-luci-size="15"></div>
	<div id="blog-box" class="box narrow">
		<section id="blog-intro">
			<h1>Luci's Web Lög</h1>
			<p class="center">
				Read the musings of an internet stranger. Perhaps you'll find some of them insightful.
			</p>
		${I(2, T(blogControlsHtml()))}
		${I(2, T(blogHistoryHtml(json)))}
	</div>
</main>
`;



// ## Exports

export default blogBodyHtml;
