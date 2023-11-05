/* eslint-disable no-undef */
function save_options() {
	const use6Channels = document.getElementById("use51").checked;
	const showAllTracks = document.getElementById("showAllTracks").checked;
	const setMaxBitrate = document.getElementById("setMaxBitrate").checked;
	const disableVP9 = document.getElementById("disableVP9").checked;
	const disableAV1 = document.getElementById("disableAV1").checked;
	const disableHPL = document.getElementById("disableHPL").checked;
	const preferredLocale = document.getElementById("preferredLocale").value;
	const preferredTextLocale = document.getElementById("preferredTextLocale").value;

	chrome.storage.sync.set({
		use6Channels: use6Channels,
		showAllTracks: showAllTracks,
		setMaxBitrate: setMaxBitrate,
		disableVP9: disableVP9,
		disableAV1: disableAV1,
		disableHPL: disableHPL,
		preferredLocale: preferredLocale,
		preferredTextLocale: preferredTextLocale,
	}, function() {
		var status = document.getElementById("status");
		status.textContent = "Options saved.";
		setTimeout(function() {
			status.textContent = "";
		}, 2000);
	});
}

function reset_options() {
	document.getElementById("use51").checked = true;
	document.getElementById("showAllTracks").checked = true;
	document.getElementById("setMaxBitrate").checked = false;
	document.getElementById("disableVP9").checked = false;
	document.getElementById("disableAV1").checked = true;
	document.getElementById("disableHPL").checked = false;
	document.getElementById("preferredLocale").value = null;
	document.getElementById("preferredTextLocale").value = null;

	chrome.storage.sync.set({
		use6Channels: true,
		showAllTracks: true,
		setMaxBitrate: false,
		disableVP9: false,
		disableAV1: true,
		disableHPL: false,
		preferredLocale: null,
		preferredTextLocale: null,
	}, function() {
		var status = document.getElementById("status");
		status.textContent = "Options reset.";
		setTimeout(function() {
			status.textContent = "";
		}, 2000);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		use6Channels: true,
		showAllTracks: true,
		setMaxBitrate: false,
		disableVP9: false,
		disableAV1: true,
		disableHPL: false,
		preferredLocale: null,
		preferredTextLocale: null,
	}, function(items) {
		document.getElementById("use51").checked = items.use6Channels;
		document.getElementById("showAllTracks").checked = items.showAllTracks;
		document.getElementById("setMaxBitrate").checked = items.setMaxBitrate;
		document.getElementById("disableVP9").checked = items.disableVP9;
		document.getElementById("disableAV1").checked = items.disableAV1;
		document.getElementById("disableHPL").checked = items.disableHPL;
		document.getElementById("preferredLocale").value = items.preferredLocale;
		document.getElementById("preferredTextLocale").value = items.preferredTextLocale;
	});
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("reset").addEventListener("click", reset_options);
