// ## Imports

import {
	type Null,
	type HtmlString,
	type UrlString,
} from "../../../scripts/ts/utils.ts";

import {
	type PageData,
	stringIndent as I,
	stringTrim   as T,
} from "../$gen-utils.ts";



// ## Constants

const iconLocation   = "assets/images/favicon.ico";
const headerLocation = "__header.html";
const footerLocation = "__footer.html";



// ## Functions

const titleHtml = (data: PageData) => /*html*/`
<title>${
	data.blogPostMetadata ?
	`${data.blogPostMetadata.title} ~ The Power Of Five / ${
		data.name ?? data.code
	}` :
	`The Power Of Five / ${
		data.name ?? data.code
	}`
}</title>
`;


const iconHtml = (data: PageData) => /*html*/`
<link rel="icon" type="image/x-icon" href="${
	data.baseUrl ?? ""
}${iconLocation}">
`;


const stylesHtml = (
	paths: Null<UrlString>[],
	base:  UrlString = ""
) => /*html*/`${
	["styles/luci.css"].concat(paths.filter(path => path !== null)).map(
		path =>
		/*html*/`<link rel="stylesheet" type="text/css" media="all" href="${
			base
		}${
			path
		}">`
	).join("\n")
}`;


const scriptsHtml = (
	paths: Null<UrlString>[],
	base:  UrlString = ""
) => /*html*/`${
	["scripts/js/@luci.js"].concat(paths.filter(path => path !== null)).map(
		path =>
		/*html*/`<script type="module" src="${base}${path}"></script>`
	).join("\n")
}`;


const headerHtml = (data: PageData) => /*html*/`
<header>
	<a id="skip-to-main" href="#main">skip to main content</a>
	<iframe id="header-i" title="Navigation bar" src="${
		data.baseUrl ?? ""
	}${headerLocation}"></iframe>
</header>
`;


const footerHtml = (data: PageData) => /*html*/`
<footer>
	<iframe id="footer-i" title="Footer" src="${
		data.baseUrl ?? ""
	}${footerLocation}"></iframe>
</footer>
`;


const pageHtml = (bodyHtml: HtmlString, data: PageData) => /*html*/`
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="author" content="Lucilla Blessing">
		<meta name="color-scheme" content="light dark">
		<meta name="description" content="Embrace the spark of creation. Make art. Spread joy. Repeat.">
		<meta name="theme-color" content="#ffeaf2">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		${I(2, T(titleHtml(data)))}
		${I(2, T(iconHtml(data)))}
		${I(2, T(stylesHtml(data.stylePaths, data.baseUrl)))}
		${I(2, T(scriptsHtml(data.scriptPaths, data.baseUrl)))}
	</head>
	<body data-luci-page="${data.code}">
		${I(2, T(headerHtml(data)))}
		${I(2, T(bodyHtml))}
		${I(2, T(footerHtml(data)))}
	</body>
</html>
`;



// ## Exports

export default pageHtml;
