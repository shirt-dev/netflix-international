function save_options() {
    const use6Channels = document.getElementById("use51").checked;
    const showAllTracks = document.getElementById("showAllTracks").checked;
    const setMaxBitrate = document.getElementById("setMaxBitrate").checked;
    const disableVP9 = document.getElementById("disableVP9").checked;

    chrome.storage.sync.set({
        use6Channels,
        showAllTracks,
        setMaxBitrate,
        disableVP9,
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        use6Channels: true,
        showAllTracks: true,
        setMaxBitrate: false,
        disableVP9: false,
    }, function(items) {
        document.getElementById("use51").checked = items.use6Channels;
        document.getElementById("showAllTracks").checked = items.showAllTracks;
        document.getElementById("setMaxBitrate").checked = items.setMaxBitrate;
        document.getElementById("disableVP9").checked = items.disableVP9;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);