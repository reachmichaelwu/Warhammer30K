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
  // ── Primarchs ─────────────────────────────────────────────────
  "lion":             "artwork_omnibus/40k_the_lion_by_iscaneus_de13wcg-fullview.jpg",
  "sanguinius":       "artwork_omnibus/30k-blood-angels-the-red-angel.png",
  "horus":            "artwork_omnibus/duo-luna-wolves-sons-of-horus.png",
  "alpharius":        "artwork_omnibus/30k-alpha-legion-pech.png",
  "fulgrim":          "artwork_omnibus/duo-emperors-children-eidolon-lucius.png",
  "perturabo":        "artwork_omnibus/duo-iron-warriors-forrix-kroeger.png",
  "curze":            "artwork_omnibus/30k-night-lords-talos.png",
  "angron":           "artwork_omnibus/duo-world-eaters-captain-sarrin.png",
  "lorgar":           "artwork_omnibus/30k-word-bearers-erebus.png",
  "mortarion":        "artwork_omnibus/duo-death-guard-elite.png",
  "magnus":           "artwork_omnibus/duo-thousand-sons-amon-sanakht.png",
  "ferrus":           "artwork_omnibus/30k-iron-hands-santar.png",
  "vulkan":           "artwork_omnibus/duo-salamanders-tkell-atok.png",
  "corax":            "artwork_omnibus/30k-raven-guard-hef.png",
  "guilliman":        "artwork_omnibus/duo-ultramarines-gage-thiel.png",
  "dorn":             "artwork_omnibus/duo-imperial-fists-rann-archamus-thane.png",
  "russ":             "artwork_omnibus/duo-space-wolves.png",
  "khan":             "artwork_omnibus/duo-white-scars-elite.png",
  // ── Sons of Horus named characters ────────────────────────────
  "garviel_loken":    "artwork_omnibus/30k-luna-wolves-loken.png",
  "maloghurst":       "artwork_omnibus/duo-sons-of-horus-argonis-maloghurst.png",
  "ezekyle_abaddon":  "artwork_omnibus/duo-mournival.png",
  "little_horus":     "artwork_omnibus/30k-sons-of-horus-aximand.png",
  "tybalt_marr":      "artwork_omnibus/duo-meduson-vs-tybalt-marr.png",
  // ── Word Bearers named characters ─────────────────────────────
  "erebus":           "artwork_omnibus/30k-word-bearers-erebus.png",
  "argel_tal":        "artwork_omnibus/duo-first-heretic-aquillon-argel_tal.png",
  "kor_phaeron":      "artwork_omnibus/30k-duo-marius-gage-vs-kor-phaeron.png",
  // ── Iron Hands named characters ───────────────────────────────
  "shadrak_meduson":  "artwork_omnibus/30k-iron-hands-meduson.png",
  "iron_father":      "artwork_omnibus/30k-iron-hands-santar.png",
  // ── Alpha Legion named characters ─────────────────────────────
  "armillus_dynat":   "artwork_omnibus/duo-alpha-legion-exodus-dynat.png",
  "exodus_al":        "artwork_omnibus/duo-alpha-legion-exodus-dynat.png",
  // ── World Eaters named characters ─────────────────────────────
  "kharn":            "artwork_omnibus/duo-sigismund-vs-kharn.png",
  // ── Night Lords named characters ──────────────────────────────
  "sevatar":          "artwork_omnibus/duo-night-lords-sevatar-shang.png",
  // ── Thousand Sons named characters ────────────────────────────
  "ahriman":          "artwork_omnibus/duo-thousand-sons-amon-sanakht.png",
  "magistus_amon":    "artwork_omnibus/duo-thousand-sons-amon-sanakht.png",
  // ── Blood Angels named characters ─────────────────────────────
  "raldoron":         "artwork_omnibus/duo-blood-angels.png",
  "dom_zephon":       "artwork_omnibus/duo-blood-angels.png",
  // ── Ultramarines named characters ─────────────────────────────
  "remus_ventanus":   "artwork_omnibus/duo-ultramarines-gage-thiel.png",
  // ── Death Guard named characters ──────────────────────────────
  "calas_typhon":     "artwork_omnibus/duo-death-guard-elite.png",
  // ── Dark Angels named characters ──────────────────────────────
  "inner_circle":     "artwork_omnibus/duo-dark-angels-corswain-alajos.png",
  // ── Knights Errant ────────────────────────────────────────────
  "garro":            "artwork_omnibus/duo-knights-errant-garro-qruze.png",
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
  "dark_angels":       "Darkangels.jpg",
  "blood_angels":      "bloodangels.jpg",
  "sons_of_horus":     "lunawolves.jpg",
  // ── Extended faction art from artwork_omnibus ──────────────────────────────
  "emperors_children": "artwork_omnibus/duo-emperors-children-saul-lucius.png",
  "iron_warriors":     "artwork_omnibus/duo-iron-warriors-dantioch-krendel.png",
  "white_scars":       "artwork_omnibus/duo-white-scars-elite.png",
  "space_wolves":      "artwork_omnibus/duo-space-wolves.png",
  "imperial_fists":    "artwork_omnibus/duo-imperial-fists-rann-archamus-thane.png",
  "night_lords":       "artwork_omnibus/duo-night-lords-sevatar-shang.png",
  "iron_hands":        "artwork_omnibus/30k-iron-hands-meduson.png",
  "world_eaters":      "artwork_omnibus/duo-world-eaters.png",
  "ultramarines":      "artwork_omnibus/30k-ultramarines-1-.png",
  "death_guard":       "artwork_omnibus/duo-death-guard.png",
  "thousand_sons":     "artwork_omnibus/duo-thousand-sons-amon-sanakht.png",
  "word_bearers":      "artwork_omnibus/30k-word-bearers-erebus.png",
  "salamanders":       "artwork_omnibus/duo-salamanders.png",
  "raven_guard":       "artwork_omnibus/30k-raven-guard-hef.png",
  "alpha_legion":      "artwork_omnibus/duo-alpha-legion.png",
};

// ━━━ HELPER: resolve artwork path ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function _artworkPath(val) {
  // If the value already contains a path separator it's a full relative path
  return val.indexOf("/") !== -1 ? val : "artwork/" + val;
}
function getUnitArtwork(unitId, factionId, allegiance) {
  if (unitId && UNIT_ARTWORK_MAP[unitId]) {
    return _artworkPath(UNIT_ARTWORK_MAP[unitId]);
  }
  if (factionId && FACTION_ARTWORK_MAP[factionId]) {
    return _artworkPath(FACTION_ARTWORK_MAP[factionId]);
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
