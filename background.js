/* eslint-disable no-undef */
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

chrome.webRequest.onBeforeRequest.addListener(
	function (details) {
		if (getBrowser() == "Chrome") {
			return { redirectUrl: chrome.runtime.getURL("cadmium-playercore-shim.js") };
		}
		
		/* Work around funky CORS behaviour on Firefox */
		else if (getBrowser() == "Firefox") {
			let filter = browser.webRequest.filterResponseData(details.requestId);
			let encoder = new TextEncoder();
			filter.onstop = () => {
				fetch(browser.runtime.getURL("cadmium-playercore-shim.js")).
					then(response => response.text()).
					then(text => {
						filter.write(encoder.encode(text));
						filter.close();
					});
			};
			return {};
		}
		
		else {
			console.error("Unsupported web browser.");
			return {};
		}
	}, {
		urls: [
			"*://assets.nflxext.com/*/ffe/player/html/*",
			"*://assets.nflxext.com/player/html/ffe/*"
		],
		types: ["script"]
	}, ["blocking"]
);
