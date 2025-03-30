import { imgPath, randomColor, } from "./utils.js";
const primaryFilters = [
    "music",
    "papers",
    "code",
    "videos",
    "other",
];
const secondaryFilters = [
    "major",
    "minor",
    "ancient",
];
const writingFilters = [
    "math",
    "music",
    "misc",
];
const primaryFiltersX = [
    ...primaryFilters,
    "all",
];
const secondaryFiltersX = [
    ...secondaryFilters,
    "wishlist",
    "hidden",
];
const writingFiltersX = [
    ...writingFilters,
    "hidden",
];
function isProjectTagPrimary(s) {
    return primaryFilters.includes(s);
}
function isProjectTagSecondary(s) {
    return secondaryFilters.includes(s);
}
function isWritingTag(s) {
    return writingFilters.includes(s);
}
function isProjectTagPrimaryX(s) {
    return primaryFiltersX.includes(s);
}
function isProjectTagSecondaryX(s) {
    return secondaryFiltersX.includes(s);
}
function isWritingTagX(s) {
    return writingFiltersX.includes(s);
}
function createImage(dest, thumb) {
    dest.alt = "";
    dest.src = (thumb === null ?
        `${imgPath}unknown.png` :
        `${imgPath}projects/${thumb}`);
}
function createLinks(dest, links) {
    if (links.length > 0) {
        dest.classList.add("links");
        for (const link of links) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = link.href;
            a.textContent = link.a;
            li.appendChild(a);
            dest.appendChild(li);
        }
    }
}
function createSmall(dest, project, style) {
    if (project.date &&
        project.date.length > 0) {
        const time = document.createElement("time");
        const year = project.date[0].toString();
        time.textContent = year;
        time.dateTime = year;
        dest.appendChild(document.createTextNode("("));
        dest.appendChild(time);
        if (style === "projects" && project.tags.length > 0) {
            dest.appendChild(document.createTextNode(`,\u00A0${project.tags[0]})`));
        }
        else {
            dest.appendChild(document.createTextNode(")"));
        }
    }
}
function createThumb(dest, project) {
    var _a;
    const thumb = project.thumbnail;
    const noThumb = undefined === thumb;
    const unknownThumb = null === thumb;
    if (noThumb)
        dest.classList.add("no-thumb");
    if (unknownThumb)
        dest.classList.add("unknown-thumb");
    if (noThumb || unknownThumb) {
        dest.style.backgroundColor = randomColor();
    }
    if (project.links && project.links.length > 0) {
        const firstLink = project.links[0];
        const a = document.createElement("a");
        a.href = firstLink.href;
        const label = ((_a = project.thumbnailLabel) !== null && _a !== void 0 ? _a : `${project.title} on ${firstLink.a}`);
        if (!noThumb) {
            const img = document.createElement("img");
            createImage(img, thumb);
            a.title = label;
            a.ariaLabel = label;
            a.appendChild(img);
        }
        if (noThumb || unknownThumb) {
            const span = document.createElement("span");
            span.textContent = project.title;
            span.ariaHidden = "true";
            a.appendChild(span);
        }
        dest.appendChild(a);
    }
    else {
        if (!noThumb) {
            const img = document.createElement("img");
            createImage(img, thumb);
            dest.appendChild(img);
        }
        if (noThumb || unknownThumb) {
            const span = document.createElement("span");
            span.textContent = project.title;
            span.ariaHidden = "true";
            dest.appendChild(span);
        }
    }
}
function createTitle(dest, project, style) {
    let titleFull = project.titleFull;
    let titleShort = (project.titleHyphenated ?
        project.titleHyphenated.replace(/\^/g, "\u00AD") :
        project.title);
    if (style === "writing") {
        let qualifier = project.writingQualifier;
        if (qualifier) {
            if (titleFull)
                titleFull = `${titleFull}, ${qualifier}`;
            titleShort = `${titleShort}, ${qualifier}`;
        }
    }
    if (titleFull) {
        if (style === "writing") {
            dest.textContent = titleFull;
        }
        else {
            const abbr = document.createElement("abbr");
            abbr.title = titleFull;
            abbr.textContent = titleShort;
            dest.appendChild(abbr);
            const span = document.createElement("span");
            span.textContent = titleFull;
            span.classList.add("visua11y-hidden");
            dest.appendChild(span);
        }
    }
    else {
        dest.textContent = titleShort;
    }
}
function createCopyButton(dest, onClick) {
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "copy gallery html to clipboard!";
    copyButton.onclick = onClick;
    dest.appendChild(copyButton);
}
function createProjectControlPrimary(dest, options) {
    const { filter, activeFilter, onChange } = options;
    const control = document.createElement("input");
    const label = document.createElement("label");
    const id = `primary-filter-${filter}`;
    control.type = "radio";
    control.name = "primary-filters";
    control.id = id;
    control.checked = filter === activeFilter;
    control.addEventListener("change", onChange);
    control.setAttribute("data-luci-filter", filter);
    label.htmlFor = id;
    label.textContent = filter;
    dest.appendChild(control);
    dest.appendChild(label);
}
function createProjectControlSecondary(dest, options) {
    const { filter, activeFilters, onChange } = options;
    const control = document.createElement("input");
    const label = document.createElement("label");
    const id = `secondary-filter-${filter}`;
    control.type = "checkbox";
    control.name = "secondary-filters";
    control.id = id;
    control.checked = activeFilters.has(filter);
    control.addEventListener("change", onChange);
    control.setAttribute("data-luci-filter", filter);
    label.htmlFor = id;
    label.textContent = filter;
    dest.appendChild(control);
    dest.appendChild(label);
}
function createControls(dests, options) {
    const { projectSelection, primaryControls, secondaryControls, } = dests;
    const { activePrimaryFilter, activeSecondaryFilters, allowCopyingHtml, onChange, onCopy, } = options;
    primaryControls.id = "primary-filters";
    secondaryControls.id = "secondary-filters";
    const primaryLegend = document.createElement("legend");
    const secondaryLegend = document.createElement("legend");
    primaryLegend.appendChild(document.createTextNode("pick one:"));
    secondaryLegend.appendChild(document.createTextNode("pick zero or more:"));
    primaryControls.appendChild(primaryLegend);
    secondaryControls.appendChild(secondaryLegend);
    createProjectControlPrimary(primaryControls, { filter: "all", activeFilter: activePrimaryFilter, onChange });
    for (const filter of primaryFilters) {
        createProjectControlPrimary(primaryControls, { filter, activeFilter: activePrimaryFilter, onChange });
    }
    for (const filter of secondaryFilters) {
        createProjectControlSecondary(secondaryControls, { filter, activeFilters: activeSecondaryFilters, onChange });
    }
    projectSelection.appendChild(primaryControls);
    projectSelection.appendChild(secondaryControls);
    if (allowCopyingHtml) {
        createCopyButton(projectSelection, onCopy);
    }
}
function createProjectGalleryEntry(dest, project) {
    const descSection = document.createElement("section");
    const thumbSection = document.createElement("section");
    const title = document.createElement("h2");
    const small = document.createElement("small");
    dest.classList.add("project");
    descSection.classList.add("project-desc");
    thumbSection.classList.add("project-thumbnail");
    for (const tag of project.tags)
        dest.classList.add(tag);
    createThumb(thumbSection, project);
    createTitle(title, project, "projects");
    createSmall(small, project, "projects");
    descSection.appendChild(title);
    descSection.appendChild(small);
    if (project.blurb) {
        const blurb = document.createElement("p");
        blurb.insertAdjacentHTML("beforeend", project.blurb);
        descSection.appendChild(blurb);
    }
    if (project.links) {
        const links = document.createElement("ul");
        createLinks(links, project.links);
        descSection.appendChild(links);
    }
    dest.appendChild(thumbSection);
    dest.appendChild(descSection);
}
function createProjectGallery(dests, options) {
    const { gallery, numMatched } = dests;
    const { projectJson, showHidden } = options;
    numMatched.id = "gallery-num-matched";
    numMatched.textContent = "";
    gallery.appendChild(numMatched);
    for (const project of projectJson) {
        if (!project.tags.includes("wishlist") &&
            (showHidden || !project.tags.includes("hidden"))) {
            const article = document.createElement("article");
            createProjectGalleryEntry(article, project);
            gallery.appendChild(article);
        }
    }
}
function createWishlistEntry(dest, project) {
    const title = document.createElement("b");
    createTitle(title, project, "projects");
    dest.appendChild(title);
    if (project.blurb) {
        const blurb = document.createElement("i");
        blurb.insertAdjacentHTML("beforeend", project.blurb);
        dest.appendChild(document.createTextNode(": "));
        dest.appendChild(blurb);
    }
}
function createWishlist(dests, options) {
    const { wishlist, numMatched } = dests;
    const { projectJson, showHidden } = options;
    const headings = new Map();
    const ulists = new Map();
    for (const filter of primaryFilters) {
        const heading = document.createElement("h2");
        const ulist = document.createElement("ul");
        heading.textContent = filter;
        heading.classList.add("wishlist-heading");
        heading.setAttribute("data-luci-filter", filter);
        headings.set(filter, heading);
        ulist.classList.add("wishlist-list");
        ulist.setAttribute("data-luci-filter", filter);
        ulists.set(filter, ulist);
    }
    for (const project of projectJson) {
        if (project.tags.includes("wishlist") &&
            (showHidden || !project.tags.includes("hidden"))) {
            const li = document.createElement("li");
            createWishlistEntry(li, project);
            const firstTag = project.tags[0];
            if (isProjectTagPrimary(firstTag)) {
                const ulist = ulists.get(firstTag);
                if (ulist)
                    ulist.appendChild(li);
            }
        }
    }
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "wishlist";
    details.appendChild(summary);
    numMatched.id = "wishlist-num-matched";
    numMatched.textContent = "";
    details.appendChild(numMatched);
    for (const filter of primaryFilters) {
        const heading = headings.get(filter);
        const ulist = ulists.get(filter);
        if (heading && ulist && ulist.childElementCount > 0) {
            details.appendChild(heading);
            details.appendChild(ulist);
        }
    }
    wishlist.appendChild(details);
}
function createWritingGalleryEntry(dest, project) {
    var _a, _b;
    const title = document.createElement("h2");
    const small = document.createElement("small");
    createTitle(title, project, "writing");
    createSmall(small, project, "writing");
    dest.appendChild(title);
    dest.appendChild(small);
    const blurbData = (_a = project.writingBlurb) !== null && _a !== void 0 ? _a : project.blurb;
    if (blurbData) {
        const blurb = document.createElement("p");
        blurb.insertAdjacentHTML("beforeend", blurbData);
        dest.appendChild(blurb);
    }
    const linksData = (_b = project.writingLinks) !== null && _b !== void 0 ? _b : project.links;
    if (linksData) {
        const links = document.createElement("ul");
        createLinks(links, linksData);
        dest.appendChild(links);
    }
}
function createWritingGallery(dest, options) {
    const { projectJson, showHidden } = options;
    const detailses = new Map();
    for (const filter of writingFilters) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = filter;
        details.appendChild(summary);
        details.classList.add("writing-section");
        details.open = true;
        detailses.set(filter, details);
    }
    for (const project of projectJson) {
        if (project.writingTags &&
            (project.writingTags.length > 0) &&
            (showHidden || !project.writingTags.includes("hidden"))) {
            const article = document.createElement("article");
            createWritingGalleryEntry(article, project);
            const firstTag = project.writingTags[0];
            if (isWritingTag(firstTag)) {
                const details = detailses.get(firstTag);
                if (details)
                    details.appendChild(article);
            }
        }
    }
    for (const filter of writingFilters) {
        const details = detailses.get(filter);
        if (details && details.querySelectorAll("article").length > 0) {
            dest.appendChild(details);
        }
    }
}
export { primaryFilters, secondaryFilters, writingFilters, isProjectTagPrimary, isProjectTagSecondary, isWritingTag, isProjectTagPrimaryX, isProjectTagSecondaryX, isWritingTagX, createCopyButton, createControls, createProjectGallery, createWishlist, createWritingGallery, };
