// ## Imports

import {
	type WritingTag,
	type ProjectLink,
	type Project,
	type ProjectJson,
	writingFilters,
} from "../../../scripts/ts/utils-portfolio.ts";

import {
	stringGlue   as G,
	stringIndent as I,
	stringTrim   as T,
} from "../$gen-utils.ts";



// ## Functions

const titleShortHtml = (p: Project) => /*html*/`
<h2>${
	p.titleHyphenated ?
	p.titleHyphenated.replaceAll("^", "&shy;") :
	p.title
}${
	p.writingQualifier ?
	`, ${p.writingQualifier}` :
	""
}</h2>
`;


const titleFullHtml = (p: Project) => /*html*/`
<h2>${p.titleFull}${
	p.writingQualifier ?
	`, ${p.writingQualifier}` :
	""
}</h2>
`;


const titleHtml = (p: Project) => /*html*/`${
	p.titleFull ?
	T(titleFullHtml(p)) :
	T(titleShortHtml(p))
}`;


const smallHtml = (p: Project) => /*html*/`
<small>(${
	p.date && p.date.length > 0 ?
	/*html*/`<time datetime="${p.date[0]}">${p.date[0]}</time>` :
	"unknown"
})</small>
`;


const linksHtml = (links: ProjectLink[]) => /*html*/`
<ul class="links">
	${
		I(1,
			links.map(
				link => /*html*/`<li><a href="${link.href}">${link.a}</a></li>`
			).join("\n")
		)
	}
</ul>
`;


const galleryEntryHtml = (p: Project) => /*html*/`
<${
	p.writingTags && p.writingTags.includes("hidden") ?
	'article class="hidden" style="display: none;"' :
	"article"
}>
	${
		I(1,
			G("\n",
				T(titleHtml(p)),
				T(smallHtml(p)),
				p.writingBlurb ?? p.blurb ?
				/*html*/`<p>${p.writingBlurb ?? p.blurb}</p>` :
				"",
				(p.writingLinks ?? p.links) &&
				(p.writingLinks ?? p.links)!.length > 0 ?
				T(linksHtml((p.writingLinks ?? p.links)!)) :
				""
			)
		)
	}
</article>
`;

const galleryGroupHtml = (json: ProjectJson, tag: WritingTag) => /*html*/`
<${
	json.filter(
		p =>
		p.writingTags &&
		p.writingTags.includes(tag) &&
		!p.writingTags.includes("hidden")
	).length === 0 ?
	'details class="writing-section" style="display: none;" open' :
	'details class="writing-section" open'
}>
	<summary class="negative-text">${tag}</summary>
	${
		I(1, 
			json.filter(
				p =>
				p.writingTags && p.writingTags.includes(tag)
			).map(
				p => T(galleryEntryHtml(p))
			).join("\n")
		)
	}
</details>
`;


const galleryHtml = (json: ProjectJson) => /*html*/`
<section id="writing-gallery" class="writing-gallery">
	${
		I(1,
			writingFilters.map(
				tag => T(galleryGroupHtml(json, tag))
			).join("\n")
		)
	}
</section>
`;


const writingBodyHtml = (json: ProjectJson) => /*html*/`
<main id="main">
	<div id="writing-gallery-box" class="box very-wide">
		<section id="writing-intro">
			<h1>My Writing!</h1>
			<p id="writing-intro-desc" class="center">
				Here you can read my <em>fabulous</em> words of wisdom!
				Anything from math papers to liner notes to sheet music ends up here.
			</p>
		${I(2, T(galleryHtml(json)))}
	</div>
</main>
`;



// ## Exports

export default writingBodyHtml;
