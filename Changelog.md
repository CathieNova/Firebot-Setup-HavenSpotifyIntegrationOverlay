# Changelog for v1.0.1

## Added
* Added more overlay positions so you can place the widget exactly where you want:
    * `top-center`, `middle-center`, `bottom-center`
* Added a max card width setting so the overlay can stay compact instead of stretching too wide.
* Added the option to hide the album art.
* Added the option to hide the Spotify pill.
* Added the option to hide the Paused pill.
* Added options for long song and artist names:
    * truncate the text
    * scroll the text
* Added a scroll speed setting for scrolling text.
* Added separate progress bar colors:
    * start color
    * end color
* Added separate glow colors:
    * card glow color
    * thumbnail glow color

## Changed
* Renamed the old position setting to `anchorPosition`, since it supports more than just corners.
* Renamed the old progress color settings so they are easier to understand.
* Renamed the old glow color settings so they are easier to understand.
* Song and artist text now stays clear of the Spotify and Paused pill.
* Album art no longer blinks when the song changes.
* The old album art stays visible until the new album art is ready.
* Hidden album art is no longer loaded in the background.
* The overlay asks Firebot for current Spotify data less often to help avoid rate limits.
* The progress bar now uses both custom progress colors.