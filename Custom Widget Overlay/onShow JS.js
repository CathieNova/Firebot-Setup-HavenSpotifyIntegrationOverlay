const STATE_KEY = "__spotify_overlay_" + widgetId;

function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toBool(v) {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;

    if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
        if (s === "false" || s === "0" || s === "no" || s === "off") return false;
    }

    return null;
}

function toNumber(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function isUnresolvedVar(v) {
    const s = String(v == null ? "" : v).trim();
    return s.startsWith("$spotify") || s.startsWith("$$spotify");
}

function hasUnresolvedSpotifyVars(data) {
    if (!data || typeof data !== "object") return false;

    return isUnresolvedVar(data.song) ||
        isUnresolvedVar(data.artist) ||
        isUnresolvedVar(data.album) ||
        isUnresolvedVar(data.trackUrl) ||
        isUnresolvedVar(data.trackId) ||
        isUnresolvedVar(data.isPlaying) ||
        isUnresolvedVar(data.progressMs) ||
        isUnresolvedVar(data.durationMs) ||
        isUnresolvedVar(data.requester);
}

function cleanValue(v) {
    if (isUnresolvedVar(v)) return "";
    return v;
}

function cleanData(data) {
    const d = data || {};

    return {
        song: cleanValue(d.song),
        artist: cleanValue(d.artist),
        album: cleanValue(d.album),
        trackUrl: cleanValue(d.trackUrl),
        trackId: cleanValue(d.trackId),
        isPlaying: cleanValue(d.isPlaying),
        progress: cleanValue(d.progress),
        progressMs: cleanValue(d.progressMs),
        duration: cleanValue(d.duration),
        durationMs: cleanValue(d.durationMs),
        deviceName: cleanValue(d.deviceName),
        volume: cleanValue(d.volume),
        requester: cleanValue(d.requester),
        showRequester: d.showRequester,
        settings: d.settings
    };
}

function settingBool(settings, key, fallback) {
    const value = toBool(settings && settings[key]);
    return value == null ? fallback : value;
}

function nestedSetting(settings, groupName, key, fallback) {
    const group = settings && settings[groupName];
    if (group && group[key] != null) return group[key];
    return settings && settings[key] != null ? settings[key] : fallback;
}

function requestCurrentSpotify(delayMs) {
    const S = window[STATE_KEY];
    if (!S) return;

    clearTimeout(S.requestTimer);

    const now = Date.now();
    const cooldownMs = Math.max(3000, Number(S.requestCooldownMs || 15000));
    const remainingMs = Math.max(0, cooldownMs - (now - Number(S.lastCurrentRequestAt || 0)));
    const waitMs = Math.max(0, Number(delayMs || 0), remainingMs);

    S.requestTimer = setTimeout(function () {
        const S = window[STATE_KEY];
        if (!S) return;

        const now = Date.now();
        const cooldownMs = Math.max(3000, Number(S.requestCooldownMs || 15000));
        if (now - Number(S.lastCurrentRequestAt || 0) < cooldownMs) return;

        S.lastCurrentRequestAt = now;

        utils.sendMessageToFirebot("spotify-request-current", {
            widgetId: widgetId
        });
    }, waitMs);
}

function formatMs(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function applySettings(settings) {
    const root = containerElement.querySelector("#spotify-overlay");
    const card = containerElement.querySelector("#spotify-card");
    if (!root) return;

    const S = window[STATE_KEY];
    const s = settings || {};
    const style = s.style || {};

    root.style.left = "auto";
    root.style.right = "auto";
    root.style.top = "auto";
    root.style.bottom = "auto";
    root.style.transform = "none";

    const xOffset = toNumber(s.xOffsetToAnchor, 15);
    const yOffset = toNumber(s.yOffsetToAnchor, 15);
    const x = xOffset + "px";
    const y = yOffset + "px";
    const anchorPosition = String(s.anchorPosition || "top-left").toLowerCase();
    const parts = anchorPosition.split("-");
    const vertical = parts[0] || "top";
    const horizontal = parts[1] || "left";
    const transforms = [];

    if (horizontal === "center") {
        root.style.left = "calc(50% + " + xOffset + "px)";
        transforms.push("translateX(-50%)");
    } else if (horizontal === "right") {
        root.style.right = x;
    } else {
        root.style.left = x;
    }

    if (vertical === "middle") {
        root.style.top = "calc(50% + " + yOffset + "px)";
        transforms.push("translateY(-50%)");
    } else if (vertical === "bottom") {
        root.style.bottom = y;
    } else {
        root.style.top = y;
    }

    if (transforms.length > 0) {
        root.style.transform = transforms.join(" ");
    }

    root.style.setProperty("--sp-scale", String(s.scaleMultiplier == null ? 0.85 : s.scaleMultiplier));
    root.style.setProperty("--sp-card-max-width", Math.max(260, toNumber(s.cardMaxWidthPx, 760)) + "px");
    root.style.setProperty("--sp-thumb-scale", String(s.thumbnailScale == null ? 1 : s.thumbnailScale));
    root.style.setProperty("--sp-thumb-left-offset", String(s.thumbnailOffsetToLeft == null ? 0 : s.thumbnailOffsetToLeft));

    if (style.background) root.style.setProperty("--sp-bg", style.background);
    if (style.borderColor) root.style.setProperty("--sp-border", style.borderColor);
    if (style.nameFallbackColor) root.style.setProperty("--sp-name", style.nameFallbackColor);
    if (style.textColor) root.style.setProperty("--sp-text", style.textColor);
    if (style.progressStartColor) root.style.setProperty("--sp-progress-start", style.progressStartColor);
    if (style.progressEndColor) root.style.setProperty("--sp-progress-end", style.progressEndColor);
    if (style.cardGlowColor) root.style.setProperty("--sp-card-glow-color", style.cardGlowColor);
    if (style.thumbnailGlowColor) root.style.setProperty("--sp-thumbnail-glow-color", style.thumbnailGlowColor);

    if (S) {
        S.showThumbnail = settingBool(s, "showThumbnail", true);
        S.showStatusPill = settingBool(s, "showStatusPill", true);
        S.showPausedPill = settingBool(s, "showPausedPill", true);
        S.songOverflow = String(nestedSetting(s, "text", "songOverflow", "truncate")).toLowerCase();
        S.artistOverflow = String(nestedSetting(s, "text", "artistOverflow", "truncate")).toLowerCase();
        S.scrollSpeedPxPerSecond = clamp(toNumber(nestedSetting(s, "text", "scrollSpeedPxPerSecond", 35), 35), 15, 120);
        S.requestCooldownMs = Math.max(3000, toNumber(s.requestCooldownMs, 15000));
    }

    if (card) {
        if (s.showGlow === false) card.classList.add("sp-glow-off");
        else card.classList.remove("sp-glow-off");

        if (s.thumbnailGlow === false) card.classList.add("sp-thumb-glow-off");
        else card.classList.remove("sp-thumb-glow-off");
    }
}

function hideThumbnail() {
    const img = containerElement.querySelector("#spotify-thumb");
    if (!img) return;

    img.removeAttribute("src");
    img.classList.remove("sp-visible");
}

function hideSpotifyOverlay() {
    const card = containerElement.querySelector("#spotify-card");
    if (!card) return;

    stopProgressTimer();

    card.classList.remove("sp-in");
    card.classList.add("sp-hidden");
}

function showPausedOverlay(data) {
    const S = window[STATE_KEY];
    if (!S || !S.lastData) {
        hideSpotifyOverlay();
        return;
    }

    const d = S.lastData;
    const pausedText = String(data && data.pausedText ? data.pausedText : "Paused");
    const pill = containerElement.querySelector("#spotify-pill");
    const pillText = containerElement.querySelector("#spotify-pill-text");

    if (!pill || !pillText) return;

    S.isPlaying = false;
    stopProgressTimer();

    showSpotifyOverlay(d, true);

    pill.classList.add("sp-paused");
    pillText.textContent = pausedText;
    pill.classList.toggle("sp-hidden", !S.showPausedPill);
}

function updateProgressUi() {
    const S = window[STATE_KEY];
    if (!S) return;

    const wrap = containerElement.querySelector("#spotify-progress-wrap");
    const fill = containerElement.querySelector("#spotify-progress-fill");
    const nowEl = containerElement.querySelector("#spotify-progress-now");
    const totalEl = containerElement.querySelector("#spotify-progress-total");

    if (!wrap || !fill || !nowEl || !totalEl) return;

    if (!(S.durationMs > 0)) {
        wrap.classList.add("sp-hidden");
        return;
    }

    wrap.classList.remove("sp-hidden");

    const current = clamp(S.progressMs, 0, S.durationMs);
    const pct = clamp((current / S.durationMs) * 100, 0, 100);

    fill.style.width = pct + "%";
    nowEl.textContent = formatMs(current);
    totalEl.textContent = formatMs(S.durationMs);
}

function stopProgressTimer() {
    const S = window[STATE_KEY];
    if (!S) return;

    if (S.progressTimer) {
        clearInterval(S.progressTimer);
        S.progressTimer = null;
    }
}

function startProgressTimer() {
    const S = window[STATE_KEY];
    if (!S) return;

    stopProgressTimer();

    if (!(S.durationMs > 0)) {
        updateProgressUi();
        return;
    }

    S.progressTimer = setInterval(function () {
        if (S.isPlaying === false) return;

        S.progressMs += 1000;

        if (S.durationMs > 0 && S.progressMs > S.durationMs) {
            S.progressMs = S.durationMs;
        }

        updateProgressUi();
    }, 1000);
}

function preloadImage(url) {
    return new Promise(function (resolve) {
        const src = String(url || "").trim();
        if (!src) {
            resolve("");
            return;
        }

        const img = new Image();

        img.onload = function () {
            resolve(src);
        };

        img.onerror = function () {
            resolve("");
        };

        img.src = src;
    });
}

function getSpotifyThumbnail(trackUrl) {
    const url = String(trackUrl || "").trim();
    if (!url) return Promise.resolve("");

    return fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(url), {
        cache: "force-cache"
    })
        .then(function (response) {
            if (!response.ok) return null;
            return response.json();
        })
        .then(function (data) {
            if (!data) return "";
            return String(data.thumbnail_url || "").trim();
        })
        .catch(function () {
            return "";
        });
}

function rememberThumbnail(trackKey, thumbnail) {
    const S = window[STATE_KEY];
    if (!S || !trackKey || !thumbnail) return;

    if (!S.thumbnailCache[trackKey]) {
        S.thumbnailOrder.push(trackKey);
    }

    S.thumbnailCache[trackKey] = thumbnail;

    while (S.thumbnailOrder.length > 100) {
        const oldKey = S.thumbnailOrder.shift();
        delete S.thumbnailCache[oldKey];
    }
}

function loadSpotifyThumbnail(trackUrl, trackKey) {
    const S = window[STATE_KEY];
    if (!S || !S.showThumbnail) {
        hideThumbnail();
        return;
    }

    if (!String(trackUrl || "").trim()) {
        hideThumbnail();
        return;
    }

    if (S.thumbnailCache[trackKey]) {
        const img = containerElement.querySelector("#spotify-thumb");
        if (!img) return;

        img.src = S.thumbnailCache[trackKey];
        img.classList.add("sp-visible");
        return;
    }

    if (S.thumbnailLoads[trackKey]) return;

    S.thumbnailLoads[trackKey] = true;

    getSpotifyThumbnail(trackUrl)
        .then(function (thumbnail) {
            if (!thumbnail) return "";
            return preloadImage(thumbnail);
        })
        .then(function (readyThumbnail) {
            const S = window[STATE_KEY];
            if (!S) return;

            delete S.thumbnailLoads[trackKey];

            if (!readyThumbnail) return;

            rememberThumbnail(trackKey, readyThumbnail);

            if (S.trackKey !== trackKey || !S.showThumbnail) return;

            const img = containerElement.querySelector("#spotify-thumb");
            if (!img) return;

            img.src = readyThumbnail;
            img.classList.add("sp-visible");
        })
        .catch(function () {
            const S = window[STATE_KEY];
            if (S) delete S.thumbnailLoads[trackKey];
        });
}

function updateRequester(data) {
    const el = containerElement.querySelector("#spotify-requester");
    if (!el) return;

    const showRequester = toBool(data.showRequester) === true;
    const requester = String(data.requester || "").trim();

    if (!showRequester || !requester) {
        el.textContent = "";
        el.classList.remove("sp-visible");
        return;
    }

    el.innerHTML = "Requested by <span class=\"sp-requester-name\">" + esc(requester) + "</span>";
    el.classList.add("sp-visible");
}

function setSpotifyPill(isPaused) {
    const S = window[STATE_KEY];
    const pill = containerElement.querySelector("#spotify-pill");
    const pillText = containerElement.querySelector("#spotify-pill-text");

    if (!pill || !pillText || !S) return;

    if (isPaused) {
        pill.classList.add("sp-paused");
        pillText.textContent = "Paused";
        pill.classList.toggle("sp-hidden", !S.showPausedPill);
    } else {
        pill.classList.remove("sp-paused");
        pillText.textContent = "Spotify";
        pill.classList.toggle("sp-hidden", !S.showStatusPill);
    }
}

function setText(el, value, mode) {
    if (!el) return;

    let inner = el.querySelector(".sp-text-inner");
    if (!inner) {
        inner = document.createElement("span");
        inner.className = "sp-text-inner";
        el.textContent = "";
        el.appendChild(inner);
    }

    el.classList.remove("sp-scroll");
    inner.style.animationDuration = "";
    inner.style.removeProperty("--sp-scroll-distance");
    inner.textContent = value;

    requestAnimationFrame(function () {
        const S = window[STATE_KEY];
        if (!S || String(mode || "truncate").toLowerCase() !== "scroll") return;

        const overflowPx = Math.max(0, inner.scrollWidth - el.clientWidth);
        if (overflowPx <= 2) return;

        const duration = clamp((overflowPx * 2) / S.scrollSpeedPxPerSecond, 3.5, 18);

        inner.style.setProperty("--sp-scroll-distance", overflowPx + "px");
        inner.style.animationDuration = duration + "s";
        el.classList.add("sp-scroll");
    });
}

function showSpotifyOverlay(rawData, forcePaused) {
    if (hasUnresolvedSpotifyVars(rawData)) {
        requestCurrentSpotify(1500);
        return;
    }

    const d = cleanData(rawData || {});

    const card = containerElement.querySelector("#spotify-card");
    const songEl = containerElement.querySelector("#spotify-song");
    const artistEl = containerElement.querySelector("#spotify-artist");

    if (!card || !songEl || !artistEl) return;

    applySettings(d.settings);

    const song = String(d.song || "").trim();
    const artist = String(d.artist || "").trim();
    const trackUrl = String(d.trackUrl || "").trim();
    const trackId = String(d.trackId || "").trim();
    const playingValue = forcePaused ? false : toBool(d.isPlaying);

    if (!song) {
        hideSpotifyOverlay();
        requestCurrentSpotify(6000);
        return;
    }

    if (playingValue === false && !forcePaused) {
        hideSpotifyOverlay();
        return;
    }

    const trackKey = trackId || trackUrl || song + "|" + artist;
    const S = window[STATE_KEY];
    S.lastData = d;
    S.isPlaying = playingValue !== false;
    S.progressMs = Math.max(0, toNumber(d.progressMs, 0));
    S.durationMs = Math.max(0, toNumber(d.durationMs, 0));

    setText(songEl, song, S.songOverflow);
    setText(artistEl, artist, S.artistOverflow);

    updateRequester(d);
    setSpotifyPill(forcePaused === true);

    card.classList.remove("sp-hidden");
    card.classList.add("sp-in");

    updateProgressUi();

    if (forcePaused) {
        stopProgressTimer();
    } else {
        startProgressTimer();
    }

    if (!S.showThumbnail) {
        hideThumbnail();
    } else {
        S.trackKey = trackKey;
        loadSpotifyThumbnail(trackUrl, trackKey);
    }
}

window[STATE_KEY] = {
    showSpotifyOverlay: showSpotifyOverlay,
    hideSpotifyOverlay: hideSpotifyOverlay,
    showPausedOverlay: showPausedOverlay,
    trackKey: "",
    progressMs: 0,
    durationMs: 0,
    isPlaying: true,
    progressTimer: null,
    requestTimer: null,
    requestCooldownMs: 15000,
    lastCurrentRequestAt: 0,
    thumbnailCache: {},
    thumbnailOrder: [],
    thumbnailLoads: {},
    showThumbnail: true,
    showStatusPill: true,
    showPausedPill: true,
    songOverflow: "truncate",
    artistOverflow: "truncate",
    scrollSpeedPxPerSecond: 35,
    lastData: null
};

hideSpotifyOverlay();

requestCurrentSpotify(6000);