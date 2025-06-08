import { executeOnLoad, getSearchParamBool, just, toggleElement, } from "./utils.js";
let writingGallery;
let showHidden = false;
function updateGallery() {
    for (const details of writingGallery.querySelectorAll("details")) {
        let detailsVisible = false;
        for (const article of details.querySelectorAll("article")) {
            const articleVisible = (!article.classList.contains("hidden") || showHidden);
            toggleElement(article, articleVisible);
            detailsVisible || (detailsVisible = articleVisible);
        }
        toggleElement(details, detailsVisible);
    }
}
function main() {
    writingGallery = just(document.getElementById("writing-gallery"));
    showHidden = getSearchParamBool("hidden");
    updateGallery();
}
executeOnLoad(main);
