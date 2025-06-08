// ## Imports

import * as fs from "node:fs";

import {
	type HtmlString,
	type UrlString,
} from "../../scripts/ts/utils.ts";

import {
	type ProjectJson,
} from "../../scripts/ts/utils-portfolio.ts";

import {
	type BlogPostMetadata as BPMetadata,
	type PageData         as PData,
	type BlogJson         as BJson,
	type PageJson         as PJson,
	stringReline          as R,
} from "./$gen-utils.ts";

import {
	parseBlogTemplate,
} from "./$gen-parse-blog.ts";

import blogBodyHtml     from "./pages/blog-5.ts";
import projectsBodyHtml from "./pages/projects-5.ts";
import sitemapBodyHtml  from "./pages/sitemap-5.ts";
import writingBodyHtml  from "./pages/writing-5.ts";
import blogPostBodyHtml from "./pages/luci-blogposts-5.ts";
import pageHtml         from "./pages/luci-5.ts";

import pageJson    from "../../assets/data/pages.json"    with { type: "json" };
import projectJson from "../../assets/data/projects.json" with { type: "json" };
import blogJson    from "../../assets/data/blog.json"     with { type: "json" };



// ## Type declarations

type PageBodySources = Record<UrlString, () => HtmlString>;
type PageDataSource  = (metadata: BPMetadata) => PData;



// ## Constants

const pageBodySources: PageBodySources = {
	"blog":     () => blogBodyHtml(blogJson as BJson),
	"projects": () => projectsBodyHtml(projectJson as ProjectJson),
	"sitemap":  () => sitemapBodyHtml(pageJson as PJson, blogJson as BJson),
	"writing":  () => writingBodyHtml(projectJson as ProjectJson)
} as const;

const blogPostPageData: PageDataSource = (metadata: BPMetadata) => ({
	name:    "blög",
	code:    "blog",
	baseUrl: "../",
	stylePaths: [
		"styles/luci-blogposts.css",
		metadata.useMath ? "extern/katex/katex.min.css" : null
	],
	scriptPaths: [
		"scripts/js/@luci-blogposts.js",
		metadata.useMath ? "extern/katex/copy-tex.js" : null
	]
});

const fileExists = fs.existsSync;
const readFile   = fs.readFileSync;
const writeFile  = fs.writeFileSync;



// ## Functions

function blogPostBodySource(metadata: BPMetadata): HtmlString {
	return blogPostBodyHtml(
		parseBlogTemplate(
			readFile(
				`templates/blog/${metadata.id}.blog.5.html`,
				"utf8"
			)
		),
		metadata
	)
}


function generateRootPages() {
	for (const page of pageJson as PJson) {
		if (!page.noRender && pageBodySources[page.code] !== undefined) {
			writeFile(
				`../../${page.output ?? page.code}.html`,
				R(pageHtml(pageBodySources[page.code](), page))
			);
		}
	}
}


function generateBlogPosts() {
	for (const metadata of blogJson as BJson) {
		if (!fileExists(`templates/blog/${metadata.id}.blog.5.html`)) {
			continue;
		}
		writeFile(
			`../../blog/${metadata.id}.html`,
			R(
				pageHtml(
					blogPostBodySource(metadata),
					Object.assign(
						blogPostPageData(metadata),
						{ blogPostMetadata: metadata }
					)
				)
			)
		)
	}
}



// ## Top level code

generateRootPages();
generateBlogPosts();
