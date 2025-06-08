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
export { primaryFilters, secondaryFilters, writingFilters, isProjectTagPrimary, isProjectTagSecondary, isWritingTag, isProjectTagPrimaryX, isProjectTagSecondaryX, isWritingTagX, };
