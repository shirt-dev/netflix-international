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

chromeStorageGet({
	use6Channels: true,
	showAllTracks: true,
	setMaxBitrate: false,
	disableVP9: false,
	disableAV1: true,
	disableHPL: false,
	useDDPlus: false,
	preferredLocale: null,
	preferredTextLocale: null,
}).then(items => {
	// very messy workaround for accessing chrome storage outside of background / content scripts
	let mainScript = document.createElement("script");
	mainScript.type = "application/json";
	mainScript.id = "netflix-intl-settings";
	mainScript.text = JSON.stringify(items); 
	document.documentElement.appendChild(mainScript);
}).then(() => {
	// attach and include additional scripts after we have loaded the main configuration

	for (let i = 0; i < urls.length; i++) {
		const mainScriptUrl = chrome.runtime.getURL(urls[i]);
		
		const mainScript = document.createElement('script');
        mainScript.type = 'application/javascript';
        mainScript.src = mainScriptUrl;
        document.documentElement.appendChild(mainScript);
	}
});
