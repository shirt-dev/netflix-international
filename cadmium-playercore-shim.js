/* eslint-disable no-undef */
// This script runs as a drop-in replacement of the original cadmium-playercore. This is not a content script.
console.log("Netflix International script active!");

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
function get_profile_list() {
	// Always add h264 main profiles
	var custom_profiles = [
		"playready-h264mpl30-dash",
		"playready-h264mpl31-dash",
		"playready-h264mpl40-dash",
	];

	if (window.MSMediaKeys) {
		// PlayReady Specific

		// Always add 2.0 AAC profiles, some manifests fail without them
		custom_profiles = custom_profiles.concat([
			"heaac-2-dash",
			"heaac-2hq-dash",
		]);

		if (globalOptions.useDDPlus) {
			// Dolby Digital
			custom_profiles = custom_profiles.concat([
				"ddplus-2.0-dash",
			]);

			if (globalOptions.use6Channels) {
				custom_profiles = custom_profiles.concat([
					"ddplus-5.1-dash",
					"ddplus-5.1hq-dash",
					"ddplus-atmos-dash",
				]);
			}
		} else {
			// No Dolby Digital
			if (globalOptions.use6Channels) {
				custom_profiles = custom_profiles.concat([
					"heaac-5.1-dash",
				]);
			}
		}

		
	} else {
		// Widevine Specific
		custom_profiles = custom_profiles.concat([
			"playready-h264hpl30-dash",
			"playready-h264hpl31-dash",
			"playready-h264hpl40-dash",
		]);

		if (!globalOptions.disableVP9) {
			// Add VP9 Profiles if wanted
			custom_profiles = custom_profiles.concat([
				"vp9-profile0-L30-dash-cenc",
				"vp9-profile0-L31-dash-cenc",
				"vp9-profile0-L40-dash-cenc",
				"av1-main-L30-dash-cbcs-prk",
				"av1-main-L31-dash-cbcs-prk",
				"av1-main-L40-dash-cbcs-prk",
			]);
		}

		custom_profiles = custom_profiles.concat([
			"heaac-2-dash",
			"heaac-2hq-dash",
		]);

		if (globalOptions.use6Channels) {
			custom_profiles = custom_profiles.concat([
				"heaac-5.1-dash",
			]);
		}
	}

	// Always add subtitles
	custom_profiles = custom_profiles.concat([
		"dfxp-ls-sdh",
		"simplesdh",
		"nflx-cmisc",
		"imsc1.1",
		"BIF240",
		"BIF320",
	]);

	return custom_profiles;
}

// eslint-disable-next-line no-unused-vars
function get_preferred_locale() {
	return globalOptions.preferredLocale;
}

// eslint-disable-next-line no-unused-vars
function get_preferred_text_locale() {
	return globalOptions.preferredTextLocale;
}

do_patch(
	"Hello world",
	/(.*)/,
	"console.log('Netflix International script injected!'); $1"
);

do_patch(
	"Custom profiles",
	/(viewableId:.,profiles:).,/,
	"$1 get_profile_list(),"
);

do_patch(
	"Custom profiles 2",
	/(name:"default",profiles:).}/,
	"$1 get_profile_list()}"
);

do_patch(
	"Re-enable Ctrl+Shift+Alt+S menu",
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
	"preferredAudioLocale: get_preferred_locale()"
);

do_patch(
	"Set preferred text locale",
	/preferredTextLocale:.\.preferredTextLocale/,
	"preferredTextLocale: get_preferred_text_locale()"
);

// run our patched copy of playercore in a non-privileged context on the page
window.Function(cadmium_src)();
