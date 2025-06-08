// ## Imports

import {
	imgPath,
} from "../../../scripts/ts/utils.ts";

import {
	type ProjectTagPrimary,
	type ProjectTagSecondary,
	type ProjectTagPrimaryX,
	type ProjectLink,
	type Project,
	type ProjectJson,
	primaryFilters,
	secondaryFilters,
} from "../../../scripts/ts/utils-portfolio.ts";

import {
	stringGlue   as G,
	stringIndent as I,
	stringTrim   as T,
} from "../$gen-utils.ts";



// ## Functions

const imageHtml = (p: Project) => /*html*/`
<img alt="" src="${imgPath}${
	p.thumbnail !== null ?
	`projects/${p.thumbnail}` :
	"unknown.png"
}">
`;


const imageAnchorHtml = (p: Project, link: ProjectLink) => /*html*/`
<a ${
	G(" ",
		`href="${link.href}"`,
		// if `thumbnailLabel` is a string, put it;
		// else, deny a label only if `null`
		p.thumbnailLabel !== null ?
		p.thumbnailLabel !== undefined ?
		`title="${p.thumbnailLabel}"` :
		`title="${p.title} on ${link.a}"` :
		"",
		// same for aria-label
		p.thumbnailLabel !== null ?
		p.thumbnailLabel !== undefined ?
		`aria-label="${p.thumbnailLabel}"` :
		`aria-label="${p.title} on ${link.a}"` :
		"",
	)
}>
	${I(1, T(imageHtml(p)))}
</a>
`;


const noImageAnchorHtml = (p: Project, link: ProjectLink) => /*html*/`
<a ${
	G(" ",
		`href="${link.href}"`,
		// if `thumbnailLabel` is a string, put it; else nothing
		p.thumbnailLabel !== null && p.thumbnailLabel !== undefined ?
		`title="${p.thumbnailLabel}"` :
		"",
		// same for aria-label
		p.thumbnailLabel !== null && p.thumbnailLabel !== undefined ?
		`aria-label="${p.thumbnailLabel}"` :
		"",
	)
}>
	${p.title}
</a>
`;


const thumbImagedLinkedHtml = (p: Project, link: ProjectLink) => /*html*/`
<section class="project-thumbnail">
	${I(1, T(imageAnchorHtml(p, link)))}
</section>
`;


const thumbUnknownLinkedHtml = (p: Project, link: ProjectLink) => /*html*/`
<section class="project-thumbnail unknown-thumb" style="background-color: #000000;">
	${I(1, T(imageAnchorHtml(p, link)))}
</section>
`;


const thumbNoneLinkedHtml = (p: Project, link: ProjectLink) => /*html*/`
<section class="project-thumbnail no-thumb" style="background-color: #000000;">
	${I(1, T(noImageAnchorHtml(p, link)))}
</section>
`;


const thumbImagedLinklessHtml = (p: Project) => /*html*/`
<section class="project-thumbnail">
	${I(1, T(imageHtml(p)))}
</section>
`;


const thumbUnknownLinklessHtml = (p: Project) => /*html*/`
<section class="project-thumbnail unknown-thumb" style="background-color: #000000;">
	${I(1, T(imageHtml(p)))}
</section>
`;


const thumbNoneLinklessHtml = (p: Project) => /*html*/`
<section class="project-thumbnail no-thumb" style="background-color: #000000;">
	${p.title}
</section>
`;


const thumbHtml = (p: Project) => /*html*/`${
	p.links && p.links.length > 0 ? (
		p.thumbnail !== undefined ?
		p.thumbnail !== null ?
		T(thumbImagedLinkedHtml(p, p.links[0])) :
		T(thumbUnknownLinkedHtml(p, p.links[0])) :
		T(thumbNoneLinkedHtml(p, p.links[0]))
	) : (
		p.thumbnail !== undefined ?
		p.thumbnail !== null ?
		T(thumbImagedLinklessHtml(p)) :
		T(thumbUnknownLinklessHtml(p)) :
		T(thumbNoneLinklessHtml(p))
	)
}`;


const titleFullHtml = (p: Project) => /*html*/`
<h2>
	<abbr title="${p.titleFull}">${
		p.titleHyphenated ?
		p.titleHyphenated.replaceAll("^", "&shy;") :
		p.title
	}</abbr>
	<span class="visua11y-hidden">${p.titleFull}</span>
</h2>
`;


const titleShortHtml = (p: Project) => /*html*/`
<h2>${
	p.titleHyphenated ?
	p.titleHyphenated.replaceAll("^", "&shy;") :
	p.title
}</h2>
`;


const titleHtml = (p: Project) => /*html*/`${
	p.titleFull ?
	T(titleFullHtml(p)) :
	T(titleShortHtml(p))
}`;


const smallHtml = (p: Project) => /*html*/`
<small>(${
	G(
		",&nbsp;",
		p.date && p.date.length > 0 ?
		/*html*/`<time datetime="${p.date[0]}">${p.date[0]}</time>` :
		"unknown",
		p.tags.length > 0 ?
		p.tags[0] :
		""
	)
})</small>
`;


const linksHtml = (links: ProjectLink[]) => /*html*/`
<ul class="links">
	${
		I(1, 
			links.map(
				link =>
				/*html*/`<li><a href="${link.href}">${link.a}</a></li>`
			).join("\n")
		)
	}
</ul>
`;


const descriptionHtml = (p: Project) => /*html*/`
<section class="project-desc">
	${
		I(1,
			G("\n",
				T(titleHtml(p)),
				T(smallHtml(p)),
				p.blurb ? /*html*/`<p>${p.blurb}</p>` : "",
				p.links && p.links.length > 0 ? T(linksHtml(p.links)) : ""
			)
		)
	}
</section>
`;


const primaryControlHtml = (tag: ProjectTagPrimaryX) => /*html*/`
<input id="primary-filter-${
	tag
}" type="radio" name="primary-filters" data-luci-filter="${
	tag
}">
<label for="primary-filter-${tag}">${tag}</label>
`;


const secondaryControlHtml = (tag: ProjectTagSecondary) => /*html*/`
<input id="secondary-filter-${
	tag
}" type="checkbox" name="secondary-filters" data-luci-filter="${
	tag
}">
<label for="secondary-filter-${tag}">${tag}</label>
`;


const primaryControlsHtml = () => /*html*/`
<fieldset id="primary-filters">
	<legend>pick one:</legend>
	${I(1, T(primaryControlHtml("all")))}
	${
		I(1,
			primaryFilters.map(
				tag => T(primaryControlHtml(tag))
			).join("\n")
		)
	}
</fieldset>
`;


const secondaryControlsHtml = () => /*html*/`
<fieldset id="secondary-filters">
	<legend>pick zero or more:</legend>
	${
		I(1,
			secondaryFilters.map(
				tag => T(secondaryControlHtml(tag))
			).join("\n")
		)
	}
</fieldset>
`;


const galleryEntryHtml = (p: Project) => /*html*/`
<${
	G(" ",
		"article",
		`class="${
			G(" ", "project", ...p.tags)
		}"`,
		p.tags.includes("hidden") ? 'style="display: none;"' : ""
	)
}>
	${I(1, T(thumbHtml(p)))}
	${I(1, T(descriptionHtml(p)))}
</article>
`;


const galleryHtml = (json: ProjectJson) => /*html*/`
<p id="gallery-num-matched" data-luci-count="${
	json.filter(
		p =>
		!p.tags.includes("wishlist") &&
		!p.tags.includes("hidden")
	).length
}">${
	json.filter(
		p =>
		!p.tags.includes("wishlist") &&
		!p.tags.includes("hidden")
	).length
} matches</p>
${
	json.filter(
		p => !p.tags.includes("wishlist")
	).map(p => T(galleryEntryHtml(p))).join("\n")
}
`;


const wishlistTitleHtml = (p: Project) => /*html*/`
<b>${
	p.titleHyphenated ?
	p.titleHyphenated.replaceAll("^", "&shy;") :
	p.title
}</b>
`;


const wishlistEntryHtml = (p: Project) => /*html*/`
<${
	p.tags.includes("hidden") ?
	'li class="wishlist-item hidden" style="display: none;"' :
	'li class="wishlist-item"'
}>${
	p.blurb ?
	/*html*/`${T(wishlistTitleHtml(p))}: <i>${p.blurb}</i>` :
	T(wishlistTitleHtml(p))
}</li>
`;


const wishlistGroupHtml = (
	json: ProjectJson,
	tag:  ProjectTagPrimary
) => /*html*/`
<h2 class="wishlist-heading" data-luci-filter="${tag}">${tag}</h2>
<ul class="wishlist-list" data-luci-filter="${tag}">
	${
		I(1,
			json.filter(
				p =>
				p.tags.includes("wishlist") &&
				p.tags.includes(tag)
			).map(
				p => T(wishlistEntryHtml(p))
			).join("\n")
		)
	}
</ul>
`;


const wishlistHtml = (json: ProjectJson) => /*html*/`
<details>
	<summary>wishlist</summary>
	<p id="wishlist-num-matched" data-luci-count="${
		json.filter(
			p =>
			p.tags.includes("wishlist") &&
			!p.tags.includes("hidden")
		).length
	}">${
		json.filter(
			p =>
			p.tags.includes("wishlist") &&
			!p.tags.includes("hidden")
		).length
	} matches</p>
	${
		I(1,
			primaryFilters.map(
				tag => T(wishlistGroupHtml(json, tag))
			).join("\n")
		)
	}
</details>
`;


const projectsBodyHtml = (json: ProjectJson) => /*html*/`
<main id="main">
	<section id="projects-intro" class="box wide">
		<h1>My Projects!</h1>
		<p id="projects-intro-desc" style="display: none;">
			Here's a small cross-section of all the awesome and less awesome things I ever made!
			<br>You can filter by <i>category</i> (pick one) and <i>project status</i> (pick zero or more).
			<br>Or open the <i>wishlist</i> and see the more realistic of my future daydreams!
		</p>
		<noscript>
			<p class="center">
				Here's a small cross-section of all the awesome and less awesome things I ever made!
			</p>
			<p class="small center">
				This is the static version of the project gallery. To filter projects by categories, you need to enable JavaScript.
			</p>
		</noscript>
	</section>
	<section id="project-selection" style="display: none;">
		${I(2, T(primaryControlsHtml()))}
		${I(2, T(secondaryControlsHtml()))}
	</section>
	<section id="project-wishlist" class="box wide project-wishlist">
		${I(2, T(wishlistHtml(json)))}
	</section>
	<section id="project-gallery" class="project-gallery">
		${I(2, T(galleryHtml(json)))}
	</section>
</main>
`;



// ## Exports

export default projectsBodyHtml;
