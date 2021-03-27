/* This script runs as a drop-in replacement of the original cadmium-playercore */
console.log("Netflix International script active!");

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

function get_profile_list() {
	custom_profiles = [
		"playready-h264mpl30-dash",
		"playready-h264mpl31-dash",
		"playready-h264mpl40-dash",
		"playready-h264hpl30-dash",
		"playready-h264hpl31-dash",
		"playready-h264hpl40-dash",
		"heaac-2-dash",
		"heaac-2hq-dash",
		"simplesdh",
		"nflx-cmisc",
		"BIF240",
		"BIF320"
	];

	if (!globalOptions.disableVP9) {
		custom_profiles = custom_profiles.concat([
			"vp9-profile0-L30-dash-cenc",
			"vp9-profile0-L31-dash-cenc",
			"vp9-profile0-L40-dash-cenc",
		]);
	}

	if (globalOptions.use6Channels) {
		custom_profiles.push("heaac-5.1-dash");
	}

	return custom_profiles;
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
)

do_patch(
	"Re-enable Ctrl+Shift+Alt+S menu",
	/this\...\....\s*\&\&\s*this\.toggle\(\);/,
	"this.toggle();"
);

if (globalOptions.use6Channels) {
	do_patch("Show channel indicator",
	/displayName:([^\.]{1})\.([^,]{2}),/,
	"displayName:$1.$2 + \" - \" + $1.channelsFormat,"
	)
}

if (globalOptions.showAllTracks) {
	do_patch("Show all audio tracks",
		/"showAllSubDubTracks",!1/,
		"\"showAllSubDubTracks\",!0"
	)
}

// run our patched copy of playercore
eval(cadmium_src);
