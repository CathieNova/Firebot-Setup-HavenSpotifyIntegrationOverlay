const STATE_KEY = "__spotify_overlay_" + widgetId;
const S = window[STATE_KEY];

if (!S) {
    return;
}

if (messageName === "spotify-update") {
    S.showSpotifyOverlay(messageData);
}

if (messageName === "spotify-hide") {
    const allowPaused = messageData && messageData.allowPaused === true;

    if (allowPaused) {
        S.showPausedOverlay(messageData);
    } else {
        S.hideSpotifyOverlay();
    }
}