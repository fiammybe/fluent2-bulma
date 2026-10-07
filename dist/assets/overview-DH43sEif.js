//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region overview.js
var root = document.documentElement;
var themeButtons = document.querySelectorAll("[data-theme-choice]");
var densityToggle = document.querySelector("#comfortable-density");
var form = document.querySelector("#sample-form");
var fileInput = document.querySelector(".file-input");
var fileName = document.querySelector(".file-name");
var navbarBurger = document.querySelector(".navbar-burger");
var navbarMenu = document.querySelector(`#${navbarBurger.dataset.target}`);
themeButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const theme = button.dataset.themeChoice;
		if (theme === "system") delete root.dataset.theme;
		else root.dataset.theme = theme;
		themeButtons.forEach((themeButton) => {
			themeButton.setAttribute("aria-pressed", String(themeButton === button));
		});
	});
});
densityToggle.addEventListener("change", () => {
	form.classList.toggle("is-comfortable", densityToggle.checked);
});
fileInput.addEventListener("change", () => {
	fileName.textContent = fileInput.files[0]?.name ?? "No file selected";
});
form.addEventListener("submit", (event) => event.preventDefault());
navbarBurger.addEventListener("click", () => {
	const expanded = navbarBurger.getAttribute("aria-expanded") === "true";
	navbarBurger.setAttribute("aria-expanded", String(!expanded));
	navbarBurger.classList.toggle("is-active", !expanded);
	navbarMenu.classList.toggle("is-active", !expanded);
});
//#endregion
