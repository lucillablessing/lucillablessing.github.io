import { executeOnLoad, getSearchParamBool, just, randomColor, toggleElement, } from "./utils.js";
import { isProjectTagPrimaryX, isProjectTagSecondary, } from "./utils-portfolio.js";
let projectsIntroDesc;
let projectWishlist;
let projectGallery;
let projectSelection;
let primaryControls;
let secondaryControls;
let wishlistNumMatched;
let galleryNumMatched;
let activePrimaryFilter = "music";
let activeSecondaryFilters = new Set(["major"]);
let showHidden = false;
function initControls() {
    for (const control of primaryControls.querySelectorAll("input")) {
        const filter = control.getAttribute("data-luci-filter");
        control.checked = filter === activePrimaryFilter;
    }
    for (const control of secondaryControls.querySelectorAll("input")) {
        const filter = control.getAttribute("data-luci-filter");
        control.checked = (filter !== null &&
            isProjectTagSecondary(filter) &&
            activeSecondaryFilters.has(filter));
    }
}
function makeControlListeners() {
    for (const control of primaryControls.querySelectorAll("input")) {
        control.addEventListener("change", updateAll);
    }
    for (const control of secondaryControls.querySelectorAll("input")) {
        control.addEventListener("change", updateAll);
    }
}
function randomizeColors() {
    for (const thumbnail of projectGallery.querySelectorAll(".project-thumbnail.no-thumb, .project-thumbnail.unknown-thumb")) {
        if (thumbnail instanceof HTMLElement) {
            thumbnail.style.backgroundColor = randomColor();
        }
    }
}
function updateControls() {
    for (const control of primaryControls.querySelectorAll("input")) {
        if (control.checked) {
            const filter = control.getAttribute("data-luci-filter");
            if (filter && isProjectTagPrimaryX(filter)) {
                activePrimaryFilter = filter;
                break;
            }
        }
    }
    for (const control of secondaryControls.querySelectorAll("input")) {
        const filter = control.getAttribute("data-luci-filter");
        if (filter && isProjectTagSecondary(filter)) {
            if (control.checked) {
                activeSecondaryFilters.add(filter);
            }
            else {
                activeSecondaryFilters.delete(filter);
            }
        }
    }
}
function updateGalleryCount(count) {
    galleryNumMatched.textContent = (count === 0 ?
        "no matches for these filters" :
        count === 1 ?
            "1 match" :
            `${count} matches`);
    galleryNumMatched.setAttribute("data-luci-count", count.toString());
}
function updateGalleryEntry(project) {
    let visible = true;
    if ((activePrimaryFilter !== "all" &&
        !project.classList.contains(activePrimaryFilter)) || (project.classList.contains("hidden") && !showHidden)) {
        visible = false;
    }
    else {
        visible = false;
        for (const filter of activeSecondaryFilters) {
            if (project.classList.contains(filter)) {
                visible = true;
                break;
            }
        }
    }
    toggleElement(project, visible);
    return visible;
}
function updateGallery() {
    let count = 0;
    for (const project of projectGallery.children) {
        if (project instanceof HTMLElement &&
            project.classList.contains("project")) {
            const visible = updateGalleryEntry(project);
            if (visible)
                count++;
        }
    }
    updateGalleryCount(count);
}
function updateWishlistCount(count) {
    wishlistNumMatched.textContent = (count === 0 ?
        "no matches for this category" :
        count === 1 ?
            "1 match" :
            `${count} matches`);
    wishlistNumMatched.setAttribute("data-luci-count", count.toString());
}
function updateWishlistEntry(element) {
    var _a;
    let visible = false;
    if (element.classList.contains("wishlist-heading")) {
        toggleElement(element, activePrimaryFilter === "all");
        return false;
    }
    else if (element.classList.contains("wishlist-item")) {
        visible = ((!element.classList.contains("hidden") ||
            showHidden) && (activePrimaryFilter ===
            "all" ||
            activePrimaryFilter ===
                ((_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("data-luci-filter"))));
    }
    else {
        return false;
    }
    toggleElement(element, visible);
    return visible;
}
function updateWishlist() {
    let count = 0;
    for (const project of projectWishlist.querySelectorAll(".wishlist-heading, .wishlist-item")) {
        if (project instanceof HTMLElement) {
            const visible = updateWishlistEntry(project);
            if (visible)
                count++;
        }
    }
    updateWishlistCount(count);
}
function updateAll() {
    updateControls();
    updateWishlist();
    updateGallery();
}
function main() {
    projectsIntroDesc = just(document.getElementById("projects-intro-desc"));
    projectWishlist = just(document.getElementById("project-wishlist"));
    projectGallery = just(document.getElementById("project-gallery"));
    projectSelection = just(document.getElementById("project-selection"));
    primaryControls = just(document.getElementById("primary-filters"));
    secondaryControls = just(document.getElementById("secondary-filters"));
    wishlistNumMatched = just(document.getElementById("wishlist-num-matched"));
    galleryNumMatched = just(document.getElementById("gallery-num-matched"));
    toggleElement(projectsIntroDesc, true);
    toggleElement(projectSelection, true);
    showHidden = getSearchParamBool("hidden");
    initControls();
    makeControlListeners();
    randomizeColors();
    updateAll();
}
executeOnLoad(main);
