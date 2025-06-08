// ## Imports

import {
	type BlogPostMetadata,
	type PageData,
	type BlogJson,
	type PageJson,
	stringIndent as I,
	stringTrim   as T,
} from "../$gen-utils.ts";



// ## Functions

const sitemapMainPageHtml = (page: PageData) => /*html*/`
<li><a href="${
	page.output ?? page.code
}.html">${
	page.name   ?? page.code
} (<code>${
	page.output ?? page.code
}.html</code>)</a></li>
`;


const sitemapMainPagesHtml = (pages: PageJson) => /*html*/`
<ul>
	${I(1, pages.map(page => T(sitemapMainPageHtml(page))).join("\n"))}
</ul>
`;


const sitemapBlogPageHtml = (post: BlogPostMetadata) => /*html*/`
<li><a href="blog/${
	post.id
}.html">${
	post.title
} (<code>blog/${
	post.id
}.html</code>)</a></li>
`;


const sitemapBlogPagesHtml = (posts: BlogJson) => /*html*/`
<ul>
	${I(1, posts.map(post => T(sitemapBlogPageHtml(post))).join("\n"))}
</ul>
`;


const sitemapBodyHtml = (pages: PageJson, posts: BlogJson) => /*html*/`
<main id="main">
	<h1 class="box">Site Map</h1>
	<div id="sitemap">
		<div class="main-pages">
			${I(3, T(sitemapMainPagesHtml(pages)))}
		</div>
		<div class="blog-pages">
			${I(3, T(sitemapBlogPagesHtml(posts)))}
		</div>
	</div>
</main>
`;



// ## Exports

export default sitemapBodyHtml;
