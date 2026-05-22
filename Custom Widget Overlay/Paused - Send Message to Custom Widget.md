# Spotify Playback Paused
Use this in a Firebot Event with the **Send Message to Custom Widget** effect.

This tells the Spotify overlay what to do when Spotify is paused.

---

## Message Name
`spotify-hide`

---

## Data
To keep the overlay visible and show the Paused state:

```json
{
    "allowPaused": true,
    "pausedText": "Paused"
}
```

To hide the overlay when Spotify is paused:

```json
{
    "allowPaused": false
}
```

---

## Good to know
* `pausedText` changes the text shown in the Paused pill.
* `showPausedPill` in the main `spotify-update` settings controls whether the Paused pill is allowed to show.
* This does not update the song, artist, thumbnail, or progress bar.