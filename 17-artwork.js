// Artwork integration — unit thumbnails and Firing.mp4 overlay
// Loaded after 16-graphics.js

// ━━━ UNIT → ARTWORK FILE MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var UNIT_ARTWORK_MAP = {
  // ── Infantry ──────────────────────────────────────────────────
  "tactical":         "Tactical.jpg",
  "despoiler":        "Tactical.jpg",
  "tactical_support": "Tactical.jpg",
  "veteran":          "Tactical.jpg",
  "seeker":           "Tactical.jpg",
  "heavy_support":    "Tactical.jpg",
  "apothecary":       "Tactical.jpg",
  "techmarine":       "Tactical.jpg",
  "rapier_la":        "Tactical.jpg",
  "araknae":          "Tactical.jpg",
  // ── Breacher ──────────────────────────────────────────────────
  "breacher":         "Breacher.jpg",
  // ── Assault ───────────────────────────────────────────────────
  "assault":          "Assault.jpg",
  "veteran_assault":  "Assault.jpg",
  // ── Terminators ───────────────────────────────────────────────
  "cataphractii":     "Cataphractii.jpg",
  "cataphractii_cmd": "Cataphractii.jpg",
  "tartaros":         "Cataphractii.jpg",
  "tartaros_cmd":     "Cataphractii.jpg",
  "saturnine":        "Cataphractii.jpg",
  // ── Command ───────────────────────────────────────────────────
  "centurion":        "Centurion.jpg",
  "centurion_ta":     "Centurion.jpg",
  "centurion_cmd":    "Centurion.jpg",
  "praetor_pa":       "Centurion.jpg",
  "praetor_ta":       "Cataphractii.jpg",
  "praetor_sat":      "Cataphractii.jpg",
  "praetorian_cmd":   "Centurion.jpg",
  "praetorian_cmd_jp":"Centurion.jpg",
  "champion":         "Centurion.jpg",
  "chaplain":         "Centurion.jpg",
  "librarian":        "Centurion.jpg",
  "herald":           "Centurion.jpg",
  "moritat":          "Centurion.jpg",
  "master_signals":   "Centurion.jpg",
  "vigilator":        "Centurion.jpg",
  "siege_breaker":    "Centurion.jpg",
  "forge_lord":       "Centurion.jpg",
  // ── Vehicles ──────────────────────────────────────────────────
  "kratos":           "Kratos.jpg",
  "leviathan":        "Leviathan.jpg",
  "contemptor":       "Leviathan.jpg",
  "deredeo":          "Leviathan.jpg",
  "saturnine_dread":  "Leviathan.jpg",
  "predator":         "Predator.jpg",
  "rhino":            "Rhino.jpg",
  "damocles_rhino":   "Rhino.jpg",
  "land_raider":      "Rhino.jpg",
  "land_raider_exp":  "Rhino.jpg",
  "spartan":          "Rhino.jpg",
  "sicaran":          "Sicarian.jpg",
  "sicaran_venator":  "Sicarian.jpg",
  "scorpius":         "Sicarian.jpg",
};

// ━━━ FACTION → ARTWORK FILE MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var FACTION_ARTWORK_MAP = {
  "dark_angels":  "Darkangels.jpg",
  "blood_angels": "bloodangels.jpg",
  "sons_of_horus":"lunawolves.jpg",
};

// ━━━ HELPER: resolve artwork path ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getUnitArtwork(unitId, factionId, allegiance) {
  if (unitId && UNIT_ARTWORK_MAP[unitId]) {
    return "artwork/" + UNIT_ARTWORK_MAP[unitId];
  }
  if (factionId && FACTION_ARTWORK_MAP[factionId]) {
    return "artwork/" + FACTION_ARTWORK_MAP[factionId];
  }
  if (allegiance === "traitor")  return "artwork/Traitor.jpg";
  if (allegiance === "loyalist") return "artwork/Loyalist.jpg";
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
