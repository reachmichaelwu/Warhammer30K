// Artwork integration — unit thumbnails and Firing.mp4 overlay
// Loaded after 16-graphics.js

// ━━━ UNIT → ARTWORK FILE MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var UNIT_ARTWORK_MAP = {
  // ── Infantry ──────────────────────────────────────────────────
  "tactical":         "Tactical.png",
  "despoiler":        "Tactical.png",
  "tactical_support": "Tactical.png",
  "veteran":          "Tactical.png",
  "seeker":           "Tactical.png",
  "heavy_support":    "Tactical.png",
  "apothecary":       "Tactical.png",
  "techmarine":       "Tactical.png",
  "rapier_la":        "Tactical.png",
  "araknae":          "Tactical.png",
  // ── Breacher ──────────────────────────────────────────────────
  "breacher":         "Breacher.png",
  // ── Assault ───────────────────────────────────────────────────
  "assault":          "Assault.png",
  "veteran_assault":  "Assault.png",
  // ── Terminators ───────────────────────────────────────────────
  "cataphractii":     "Cataphractii.png",
  "cataphractii_cmd": "Cataphractii.png",
  "tartaros":         "Cataphractii.png",
  "tartaros_cmd":     "Cataphractii.png",
  "saturnine":        "Cataphractii.png",
  // ── Command ───────────────────────────────────────────────────
  "centurion":        "Centurion.png",
  "centurion_ta":     "Centurion.png",
  "centurion_cmd":    "Centurion.png",
  "praetor_pa":       "Centurion.png",
  "praetor_ta":       "Cataphractii.png",
  "praetor_sat":      "Cataphractii.png",
  "praetorian_cmd":   "Centurion.png",
  "praetorian_cmd_jp":"Centurion.png",
  "champion":         "Centurion.png",
  "chaplain":         "Centurion.png",
  "librarian":        "Centurion.png",
  "herald":           "Centurion.png",
  "moritat":          "Centurion.png",
  "master_signals":   "Centurion.png",
  "vigilator":        "Centurion.png",
  "siege_breaker":    "Centurion.png",
  "forge_lord":       "Centurion.png",
  // ── Vehicles ──────────────────────────────────────────────────
  "kratos":           "Kratos.png",
  "leviathan":        "Leviathan.png",
  "contemptor":       "Leviathan.png",
  "deredeo":          "Leviathan.png",
  "saturnine_dread":  "Leviathan.png",
  "predator":         "Predator.png",
  "rhino":            "Rhino.png",
  "damocles_rhino":   "Rhino.png",
  "land_raider":      "Rhino.png",
  "land_raider_exp":  "Rhino.png",
  "spartan":          "Rhino.png",
  "sicaran":          "Sicarian.png",
  "sicaran_venator":  "Sicarian.png",
  "scorpius":         "Sicarian.png",
};

// ━━━ FACTION → ARTWORK FILE MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var FACTION_ARTWORK_MAP = {
  "dark_angels":  "Darkangels.png",
  "blood_angels": "bloodangels.png",
  "sons_of_horus":"lunawolves.png",
};

// ━━━ HELPER: resolve artwork path ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getUnitArtwork(unitId, factionId, allegiance) {
  if (unitId && UNIT_ARTWORK_MAP[unitId]) {
    return "artwork/" + UNIT_ARTWORK_MAP[unitId];
  }
  if (factionId && FACTION_ARTWORK_MAP[factionId]) {
    return "artwork/" + FACTION_ARTWORK_MAP[factionId];
  }
  if (allegiance === "traitor")  return "artwork/Traitor.png";
  if (allegiance === "loyalist") return "artwork/Loyalist.png";
  return null;
}

// ━━━ REACT COMPONENT: small artwork thumbnail ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function UnitArtworkThumb({ unitId, factionId, allegiance, size, borderColor }) {
  size = size || 68;
  var src = getUnitArtwork(unitId, factionId, allegiance);
  if (!src) return null;
  return React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: size,
      height: size,
      objectFit: "cover",
      borderRadius: 6,
      border: "1.5px solid " + (borderColor || "rgba(184,134,11,0.3)"),
      flexShrink: 0,
      animation: "fadeIn 0.3s ease",
      imageRendering: "auto",
    },
    onError: function(e) { e.currentTarget.style.display = "none"; },
  });
}

// ━━━ DOM-BASED FIRING ANIMATION OVERLAY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Uses vanilla JS so we don't need to touch React render trees.
function showFiringAnimation() {
  var existing = document.getElementById("hh-firing-overlay");
  if (existing) { existing.remove(); return; }

  var overlay = document.createElement("div");
  overlay.id = "hh-firing-overlay";
  overlay.style.cssText = [
    "position:fixed", "top:0", "left:0", "right:0", "bottom:0",
    "z-index:9999",
    "display:flex", "align-items:center", "justify-content:center",
    "background:rgba(5,5,5,0.78)",
    "animation:fadeIn 0.15s ease",
    "cursor:pointer",
  ].join(";");

  var video = document.createElement("video");
  video.src = "artwork/Firing.mp4";
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.style.cssText = [
    "max-width:80vw", "max-height:80vh",
    "border-radius:10px",
    "box-shadow:0 0 80px rgba(255,120,20,0.55), 0 0 20px rgba(184,134,11,0.4)",
    "display:block",
  ].join(";");

  function dismiss() { overlay.remove(); }
  video.addEventListener("ended", dismiss);
  video.addEventListener("error", dismiss);
  overlay.addEventListener("click", dismiss);

  overlay.appendChild(video);
  document.body.appendChild(overlay);

  // Safety: auto-dismiss after 10s in case video hangs
  setTimeout(dismiss, 10000);
}
