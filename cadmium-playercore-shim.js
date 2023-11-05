/* eslint-disable no-undef */
// This script runs as a drop-in replacement of the original cadmium-playercore. This is not a content script.
console.log("Netflix International script active!");

if (window.globalOptions === undefined) {
    try {
        window.globalOptions = JSON.parse(document.getElementById("netflix-intl-settings").innerText);
    } catch(e) {
        console.error("Could not load settings:", e);
    }
}

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

function do_patch(desc, needle, replacement) {
	var match = cadmium_src.match(needle);
	if (!match) {
		alert("Failed to find patch: " + JSON.stringify(desc));
	} else {
		cadmium_src = cadmium_src.replace(needle, replacement);
		console.log("[+] Patched: " + JSON.stringify(desc));
		if (match[0].length < 200) { // avoid spamming the console
			console.log(JSON.stringify(match[0]) + " -> " + JSON.stringify(replacement));
		}
	}
}

/* We need to do a synchronous request because we need to eval
the response before the body of this script finishes executing */
var request = new XMLHttpRequest();
var cadmium_url = document.getElementById("player-core-js").src;
request.open("GET", cadmium_url + "?no_filter", false); // synchronous
request.send();

var cadmium_src = request.responseText;

// eslint-disable-next-line no-unused-vars
function get_profile_list(original_profiles) {
	var profiles = original_profiles;
	// Always add h264 main profiles
	if (original_profiles.includes("playready-h264mpl30-dash")) {
		profiles = profiles.concat([
			"playready-h264mpl30-dash",
			"playready-h264mpl31-dash",
			"playready-h264mpl40-dash",
			"h264mpl30-dash-playready-prk-qc",
			"h264mpl31-dash-playready-prk-qc",
			"h264mpl40-dash-playready-prk-qc",
		]);
	}

	if (!globalOptions.disableHPL) {
		if (original_profiles.includes("playready-h264hpl30-dash")) {
			profiles = profiles.concat([
				"playready-h264hpl30-dash",
				"playready-h264hpl31-dash",
				"playready-h264hpl40-dash",
			]);
		}
		if (original_profiles.includes("h264hpl30-dash-playready-live")) {
			profiles = profiles.concat([
				"h264hpl30-dash-playready-live",
				"h264hpl31-dash-playready-live",
				"h264hpl40-dash-playready-live",
			]);
		}
	} else {
		profiles = profiles.filter(val => !val.includes("h264hpl")); 
	}

	if (!globalOptions.disableVP9 && original_profiles.includes("vp9-profile0-L30-dash-cenc")) {
		profiles = profiles.concat([
			"vp9-profile0-L30-dash-cenc",
			"vp9-profile0-L31-dash-cenc",
			"vp9-profile0-L40-dash-cenc",
		]);
	} else {
		profiles = profiles.filter(val => !val.includes("vp9-"));
	}

	if (!globalOptions.disableAV1 && original_profiles.includes("av1-main-L30-dash-cbcs-prk")) {
		profiles = profiles.concat([
			"av1-main-L30-dash-cbcs-prk",
			"av1-main-L31-dash-cbcs-prk",
			"av1-main-L40-dash-cbcs-prk",
		]);
	} else {
		profiles = profiles.filter(val => !val.includes("av1-"));
	}

    if (globalOptions.use6Channels) {
        profiles = profiles.concat([
            "heaac-5.1-dash",
        ]);
    }

	profiles = [...new Set(profiles)].sort();
	return profiles;
}

do_patch(
	"Hello world",
	/(.*)/,
	"console.log('Netflix International script injected!'); $1"
);

do_patch(
	"Custom profiles",
	/(viewableId:.,profiles:)(.),/,
	"$1 get_profile_list($2),"
);

do_patch(
	"Custom profiles 2",
	/(name:"default",profiles:)(.)}/,
	"$1 get_profile_list($2)}"
);

do_patch(
	"Re-enable Ctrl+Shift+Alt+B menu",
	/this\...\....\s*&&\s*this\.toggle\(\);/,
	"this.toggle();"
);

if (globalOptions.showAllTracks) {
	do_patch("Show all audio tracks",
		/"showAllSubDubTracks",!1/,
		"\"showAllSubDubTracks\",!0"
	);
}

do_patch(
	"Set preferred audio locale",
	/preferredAudioLocale:.\.preferredAudioLocale/,
	"preferredAudioLocale: globalOptions.preferredLocale"
);

do_patch(
	"Set preferred text locale",
	/preferredTextLocale:.\.preferredTextLocale/,
	"preferredTextLocale: globalOptions.preferredTextLocale"
);

// run our patched copy of playercore in a non-privileged context on the page
window.Function(cadmium_src)();
