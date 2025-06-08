const calendars = [
    "gregorian",
    "blessing"
];
const dataPath = "assets/data/";
const imgPath = "assets/images/";
const svgPath = "assets/svg/";
const svgNS = "http://www.w3.org/2000/svg";
const navHeight = 56;
const transitionLength = 200;
function isCalendar(s) {
    return calendars.includes(s);
}
function executeAsync(f, delayMs = 0) {
    if (requestIdleCallback) {
        requestIdleCallback(f);
    }
    else {
        setTimeout(f, delayMs);
    }
}
function executeOnLoad(f) {
    if (document.readyState === "complete") {
        f();
    }
    else {
        window.addEventListener("load", f);
    }
}
function getSearchParamBool(option) {
    const url = new URL(window.location.href);
    return url.searchParams.has(option);
}
function getSessionBool(option) {
    if (sessionStorage.getItem("leaderOfTheUniverse") !== "Lucilla") {
        return null;
    }
    const s = sessionStorage.getItem(option);
    switch (s) {
        case "false": return false;
        case "true": return true;
        default: return null;
    }
}
function getSessionCalendar(option) {
    if (sessionStorage.getItem("leaderOfTheUniverse") !== "Lucilla") {
        return null;
    }
    const s = sessionStorage.getItem(option);
    return (s !== null && isCalendar(s)) ? s : null;
}
function just(maybe) {
    if (maybe !== null && maybe !== undefined) {
        return maybe;
    }
    else {
        throw new Error(`${maybe} is null or undefined`);
    }
}
function randomColor() {
    return `hsl(${Math.random()}turn 50% 20%)`;
}
function randomIntInRange(a, b) {
    return a + Math.floor((b - a) * Math.random());
}
function setSessionBool(option, value) {
    if (sessionStorage.getItem("leaderOfTheUniverse") === null) {
        sessionStorage.setItem("leaderOfTheUniverse", "Lucilla");
    }
    switch (value) {
        case false:
            sessionStorage.setItem(option, "false");
            return;
        case true:
            sessionStorage.setItem(option, "true");
            return;
        default: sessionStorage.removeItem(option);
    }
}
function setSessionCalendar(option, value) {
    if (sessionStorage.getItem("leaderOfTheUniverse") === null) {
        sessionStorage.setItem("leaderOfTheUniverse", "Lucilla");
    }
    if (value !== null) {
        sessionStorage.setItem(option, value);
    }
    else {
        sessionStorage.removeItem(option);
    }
}
function toggleElement(element, to) {
    if (!to) {
        element.style.display = "none";
    }
    else {
        element.style.removeProperty("display");
    }
}
export { calendars, dataPath, imgPath, svgPath, svgNS, navHeight, transitionLength, isCalendar, executeAsync, executeOnLoad, getSearchParamBool, getSessionBool, getSessionCalendar, just, randomColor, randomIntInRange, setSessionBool, setSessionCalendar, toggleElement, };
