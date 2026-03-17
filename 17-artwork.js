// Artwork integration — unit thumbnails and Firing.mp4 overlay
// Loaded after 16-graphics.js

// ━━━ UNIT → ARTWORK FILE MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var UNIT_ARTWORK_MAP = {
  // ── Infantry ──────────────────────────────────────────────────
  "tactical":          "Tactical.jpg",
  "despoiler":         "Despoiler.jpg",
  "tactical_support":  "Support.jpg",
  "veteran":           "Veteran.jpg",
  "seeker":            "Seeker.jpg",
  "heavy_support":     "Heavy_Support.jpg",
  "apothecary":        "Centurion.jpg",
  "techmarine":        "Centurion.jpg",
  "rapier_la":         "Support.jpg",
  "araknae":           "leviathan.jpg",
  // ── Breacher ──────────────────────────────────────────────────
  "breacher":          "Breacher.jpg",
  // ── Assault ───────────────────────────────────────────────────
  "assault":           "Assualt.jpg",
  "veteran_assault":   "Veteran Assualt.jpg",
  // ── Terminators ───────────────────────────────────────────────
  "cataphractii":      "Cataphractii Terminator.jpg",
  "cataphractii_cmd":  "Cataphractii Terminator.jpg",
  "tartaros":          "Tartaros Terminator.jpg",
  "tartaros_cmd":      "Tartaros Terminator.jpg",
  "saturnine":         "Saturnine Terminator.jpg",
  // ── Command ───────────────────────────────────────────────────
  "centurion":         "Centurion.jpg",
  "centurion_ta":      "Centurion Terminator.jpg",
  "centurion_cmd":     "Centurion.jpg",
  "praetor_pa":        "Centurion.jpg",
  "praetor_ta":        "Prateor_Terminator.jpg",
  "praetor_sat":       "Praetor Saturnine.jpg",
  "praetorian_cmd":    "Centurion.jpg",
  "praetorian_cmd_jp": "Centurion.jpg",
  "champion":          "Champion.jpg",
  "chaplain":          "Chaplain.jpg",
  "librarian":         "Librarian.jpg",
  "herald":            "Centurion.jpg",
  "moritat":           "Centurion.jpg",
  "master_signals":    "Master of Signals.jpg",
  "vigilator":         "Vigilator.jpg",
  "siege_breaker":     "Siege Breaker.jpg",
  "forge_lord":        "Centurion.jpg",
  // ── Loyalist Primarchs ────────────────────────────────────────
  "lion":              "Lion.jpg",
  "khan":              "Khan.jpg",
  "russ":              "Russ.jpg",
  "dorn":              "Dorn.jpg",
  "sanguinius":        "sanguinius.jpg",
  "ferrus":            "Manus.jpg",
  "guilliman":         "Guilliman.jpg",
  "vulkan":            "Vulkan.jpg",
  "corax":             "Corax.jpg",
  // ── Traitor Primarchs ─────────────────────────────────────────
  "fulgrim":           "Fulgrim.jpg",
  "perturabo":         "Perturabo.jpg",
  "curze":             "Curze.jpg",
  "angron":            "Angron.jpg",
  "mortarion":         "Mortarion.jpg",
  "magnus":            "Magnus.jpg",
  "horus":             "Horus.jpg",
  "lorgar":            "Lorgar.jpg",
  "alpharius":         "Alpharius.jpg",
  // ── Named Characters ──────────────────────────────────────────
  "garviel_loken":     "Lokien.jpg",
  "sevatar":           "Curze.jpg",
  "shadrak_meduson":   "Manus.jpg",
  "iron_father":       "Manus.jpg",
  "kharn":             "Angron.jpg",
  "little_horus":      "Horus.jpg",
  "ezekyle_abaddon":   "Horus.jpg",
  "maloghurst":        "lunawolves.jpg",
  "tybalt_marr":       "lunawolves.jpg",
  "erebus":            "Lorgar.jpg",
  "argel_tal":         "Lorgar.jpg",
  "kor_phaeron":       "Lorgar.jpg",
  "armillus_dynat":    "Alpharius.jpg",
  "exodus_al":         "Alpharius.jpg",
  "ahriman":           "Magnus.jpg",
  "magistus_amon":     "Magnus.jpg",
  "calas_typhon":      "Mortarion.jpg",
  "raldoron":          "sanguinius.jpg",
  "dom_zephon":        "sanguinius.jpg",
  "remus_ventanus":    "Guilliman.jpg",
  // ── Drop Pods ─────────────────────────────────────────────────
  "drop_pod":               "droppod.jpg",
  "dreadnought_drop_pod":   "droppod.jpg",
  "dreadclaw":              "droppod.jpg",
  // ── Vehicles ──────────────────────────────────────────────────
  "kratos":            "kratos.jpg",
  "predator":          "kratos.jpg",
  "leviathan":         "leviathan.jpg",
  "contemptor":        "leviathan.jpg",
  "deredeo":           "leviathan.jpg",
  "saturnine_dread":   "leviathan.jpg",
  "rhino":             "Rhino.jpg",
  "damocles_rhino":    "Rhino.jpg",
  "land_raider":       "Rhino.jpg",
  "land_raider_exp":   "Rhino.jpg",
  "spartan":           "Rhino.jpg",
  "sicaran":           "Sicarian.jpg",
  "sicaran_venator":   "Sicarian.jpg",
  "scorpius":          "Sicarian.jpg",
};

// ━━━ FACTION → ARTWORK FILE MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var FACTION_ARTWORK_MAP = {
  "dark_angels":       "Lion.jpg",
  "blood_angels":      "bloodangels.jpg",
  "sons_of_horus":     "lunawolves.jpg",
  "emperors_children": "Fulgrim.jpg",
  "iron_warriors":     "Perturabo.jpg",
  "white_scars":       "Khan.jpg",
  "space_wolves":      "Russ.jpg",
  "imperial_fists":    "Dorn.jpg",
  "night_lords":       "Curze.jpg",
  "iron_hands":        "Manus.jpg",
  "world_eaters":      "Angron.jpg",
  "ultramarines":      "Guilliman.jpg",
  "death_guard":       "Mortarion.jpg",
  "thousand_sons":     "Magnus.jpg",
  "word_bearers":      "Lorgar.jpg",
  "salamanders":       "Vulkan.jpg",
  "raven_guard":       "Corax.jpg",
  "alpha_legion":      "Alpharius.jpg",
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
      objectFit: "contain", background: "#1e1a14",
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
