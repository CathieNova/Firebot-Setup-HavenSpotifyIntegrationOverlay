# Spotify Playback Resumed or Changed
Use this in a Firebot Event with the **Send Message to Custom Widget** effect.

This sends the current Spotify song data to the overlay.

Use it when Spotify resumes, changes song, updates progress, or when the widget needs to refresh.

---

## Message Name
`spotify-update`

---

## Data
```json
{
    "song": "$spotifySong",
    "artist": "$spotifyArtist",
    "album": "$spotifyAlbum",
    "trackUrl": "$spotifyTrackUrl",
    "trackId": "$spotifyTrackId",
    "isPlaying": "$spotifyIsPlaying",
    "progress": "$spotifyProgress",
    "progressMs": "$spotifyProgressMs",
    "duration": "$spotifyDuration",
    "durationMs": "$spotifyDurationMs",
    "deviceName": "$spotifyDeviceName",
    "volume": "$spotifyVolume",
    "requester": "$spotifyCurrentRequesterDisplayName",
    "showRequester": true,
    "settings": {
        "anchorPosition": "top-left",
        "xOffsetToAnchor": 15,
        "yOffsetToAnchor": 15,

        "scaleMultiplier": 1.0,
        "cardMaxWidthPx": 400,

        "showThumbnail": true,
        "thumbnailScale": 1.1,
        "thumbnailGlow": true,
        "thumbnailOffsetToLeft": -2.5,

        "showStatusPill": true,
        "showPausedPill": true,

        "showGlow": true,
        "requestCooldownMs": 5000,

        "text": {
            "songOverflow": "scroll",
            "artistOverflow": "scroll",
            "scrollSpeedPxPerSecond": 35
        },

        "style": {
            "background": "rgba(10,10,16,0.70)",
            "borderColor": "rgba(156,92,255,0.70)",
            "nameFallbackColor": "#9C5CFF",
            "textColor": "#EAF7FF",
            "progressStartColor": "#40FFC0",
            "progressEndColor": "#b77dff",
            "cardGlowColor": "rgba(156,92,255,0.45)",
            "thumbnailGlowColor": "rgba(64,255,192,0.30)"
        }
    }
}
```

---

## Good to know
* You normally do not need to edit the Spotify variables.
* Edit values inside `settings` to change the overlay look and behavior.
* `requester` should only show when the current song came from the song request flow.
* `showRequester` controls whether the requester text can show.
* Colors can use `rgba(...)` or Hex colors.