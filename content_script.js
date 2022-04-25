/* eslint-disable no-undef */

var script_urls = [];

var urls = [
	"netflix_max_bitrate.js"
];

// https://stackoverflow.com/a/45985333
function getBrowser() {
	if (typeof chrome !== "undefined") {
		if (typeof browser !== "undefined") {
			return "Firefox";
		} else {
			return "Chrome";
		}
	} else {
		return "Edge";
	}
}

// promisify chrome storage API for easier chaining
function chromeStorageGet(opts) {
	if (getBrowser() == "Firefox") {
		return chrome.storage.sync.get(opts);
	}
	else {
		return new Promise(resolve => {
			chrome.storage.sync.get(opts, resolve);
		});
	}
}

function attachScript(resp) {
	let xhr = resp.target;
	let mainScript = document.createElement("script");
	mainScript.type = "application/javascript";
	if (xhr.status == 200) {
		mainScript.text = xhr.responseText;
		document.documentElement.appendChild(mainScript);
	}
}

chromeStorageGet({
	use6Channels: true,
	showAllTracks: true,
	setMaxBitrate: false,
	disableVP9: false,
	useDDPlus: false,
	preferredLocale: null,
	preferredTextLocale: null,
}).then(items => {
	// very messy workaround for accessing chrome storage outside of background / content scripts
	let mainScript = document.createElement("script");
	mainScript.type = "application/javascript";
	mainScript.text = `var globalOptions = JSON.parse('${JSON.stringify(items)}');`; 
	document.documentElement.appendChild(mainScript);
}).then(() => {
	// attach and include additional scripts after we have loaded the main configuration
	for (let i = 0; i < script_urls.length; i++) {
		let script = document.createElement("script");
		script.src = script_urls[i];
		document.documentElement.appendChild(script);
	}

	for (let i = 0; i < urls.length; i++) {
		let mainScriptUrl = chrome.extension.getURL(urls[i]);
		let xhr = new XMLHttpRequest();
		xhr.open("GET", mainScriptUrl, true);
		xhr.onload = attachScript;
		xhr.send();
	}
});
