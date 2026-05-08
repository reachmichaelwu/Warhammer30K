/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MOBILE DETECTION  (18-mobile-detect.js)
   Detects iOS / Android / mobile via user-agent + viewport, applies
   body classes, exposes window.HHMobile for app code, and installs a
   visible toggle button so the user can flip modes manually.
   The override is persisted in localStorage under "hh-mode-override".
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  "use strict";

  var MOBILE_MAX_WIDTH = 820;       // tablet / phone breakpoint (px)
  var FRAME_MIN_WIDTH  = 900;       // iOS frame preview only on wide desktop
  var STORAGE_KEY      = "hh-mode-override"; // "mobile" | "desktop"

  // ---------- Detection ----------------------------------------------------
  function detectUserAgent() {
    var ua = (navigator.userAgent || navigator.vendor || window.opera || "").toLowerCase();
    var isIOS =
      /iphone|ipod/.test(ua) ||
      /ipad/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var isAndroid = /android/.test(ua) && !/windows phone/.test(ua);
    var isMobileUA =
      isIOS ||
      isAndroid ||
      /mobile|iemobile|blackberry|opera mini|silk|kindle|webos/.test(ua);
    return { isIOS: isIOS, isAndroid: isAndroid, isMobileUA: isMobileUA, ua: ua };
  }

  function detectViewport() {
    var w =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth ||
      0;
    var h =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight ||
      0;
    return { width: w, height: h };
  }

  // ---------- Persistence -------------------------------------------------
  function getStoredOverride() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "mobile")  return true;
      if (v === "desktop") return false;
    } catch (e) {}
    return null; // no override
  }

  function setStoredOverride(forceMobile) {
    try {
      if (forceMobile === null || forceMobile === undefined) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, forceMobile ? "mobile" : "desktop");
      }
    } catch (e) {}
  }

  // ---------- Compute current state ---------------------------------------
  function compute() {
    var ua     = detectUserAgent();
    var vp     = detectViewport();
    var stored = getStoredOverride();

    var isMobile;
    if (stored !== null) {
      isMobile = stored;
    } else {
      isMobile = ua.isMobileUA || vp.width <= MOBILE_MAX_WIDTH;
    }

    // iOS frame preview only when running in desktop mode AND on a non-mobile
    // UA AND there's enough horizontal room to draw the bezel.
    var showFrame = !isMobile && !ua.isMobileUA && vp.width >= FRAME_MIN_WIDTH;

    return {
      isIOS:          ua.isIOS,
      isAndroid:      ua.isAndroid,
      isMobileUA:     ua.isMobileUA,
      isMobile:       isMobile,
      showFrame:      showFrame,
      hasOverride:    stored !== null,
      viewportWidth:  vp.width,
      viewportHeight: vp.height,
    };
  }

  function applyClasses(state) {
    var b = document.body;
    if (!b) return;
    b.classList.toggle("hh-mobile",     !!state.isMobile);
    b.classList.toggle("hh-desktop",    !state.isMobile);
    b.classList.toggle("hh-ios",        !!state.isIOS);
    b.classList.toggle("hh-android",    !!state.isAndroid);
    b.classList.toggle("hh-show-frame", !!state.showFrame);
    b.classList.toggle("hh-overridden", !!state.hasOverride);
  }

  function refresh() {
    var state = compute();
    window.HHMobile = state;
    applyClasses(state);
    updateToggleLabel();
    return state;
  }

  // ---------- Toggle button (visible UI) ----------------------------------
  function createToggle() {
    if (!document.body) return;
    if (document.getElementById("hh-mode-toggle")) return;

    var btn = document.createElement("button");
    btn.id = "hh-mode-toggle";
    btn.className = "hh-mode-toggle";
    btn.type = "button";
    btn.title = "Toggle desktop / mobile UI (long-press to clear override)";

    btn.addEventListener("click", function () {
      var current = !!(window.HHMobile && window.HHMobile.isMobile);
      var next    = !current;
      setStoredOverride(next);
      refresh();
    });

    // Long-press / right-click clears the override, returning to auto-detect
    btn.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      setStoredOverride(null);
      refresh();
    });

    document.body.appendChild(btn);
    updateToggleLabel(btn);
  }

  function updateToggleLabel(btn) {
    btn = btn || document.getElementById("hh-mode-toggle");
    if (!btn) return;
    var isMobile = !!(window.HHMobile && window.HHMobile.isMobile);
    var hasOverride = !!(window.HHMobile && window.HHMobile.hasOverride);
    btn.textContent = isMobile ? "\u{1F4BB} DESKTOP" : "\u{1F4F1} MOBILE";
    btn.classList.toggle("hh-toggle-overridden", hasOverride);
  }

  // ---------- Init --------------------------------------------------------
  function init() {
    var state = compute();
    window.HHMobile = state;
    if (document.body) {
      applyClasses(state);
      createToggle();
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        applyClasses(window.HHMobile);
        createToggle();
      });
    }
  }

  init();

  // React to viewport changes (rotation, resize, dev tools).
  var rafId = 0;
  function onResize() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      refresh();
    });
  }
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  // ---------- Public API --------------------------------------------------
  window.HHMobileRefresh = refresh;

  // Programmatic override. Pass true/false to force, or no args to clear.
  window.HHForceMobile = function (forceMobile) {
    if (forceMobile === undefined || forceMobile === null) {
      setStoredOverride(null);
    } else {
      setStoredOverride(!!forceMobile);
    }
    return refresh();
  };
})();
