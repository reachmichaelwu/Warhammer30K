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
  "rapier_la":         "Rapier.jpg",
  "rapier":            "Rapier.jpg",
  "araknae":           "Araknae.jpg",
  // ── Breacher ──────────────────────────────────────────────────
  "breacher":          "Breacher.jpg",
  // ── Assault ───────────────────────────────────────────────────
  "assault":           "Assualt.jpg",
  "veteran_assault":   "Veteran Assualt.jpg",
  // ── Custodes ──────────────────────────────────────────────────
  "custodian_guard":   "custodian_guard.jpg",
  // ── Terminators ───────────────────────────────────────────────
  "cataphractii":      "Cataphractii Terminator.jpg",
  "cataphractii_cmd":  "Cataphractii Terminator.jpg",
  "tartaros":          "Tartaros Terminator.jpg",
  "tartaros_cmd":      "Tartaros Terminator.jpg",
  "saturnine":         "Saturnine Terminator.jpg",
  "saturnine_cmd":     "Saturnine_D.jpg",
  "phraetus_conclave": "Saturnine_D.jpg",
  // ── Command ───────────────────────────────────────────────────
  "centurion":         "Centurion.jpg",
  "centurion_ta":      "Centurion Terminator.jpg",
  "centurion_sat":     "Saturnine_D.jpg",
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
  "optae":             "Optae.jpg",
  "overseer":          "Overseer.jpg",
  "praevian":          "Praevian.jpg",
  "esoterist":         "Esoterist.jpg",
  // ── Legion-specific units ─────────────────────────────────────
  "deathwing_comp":    "Deathwing.jpg",
  "dreadwing_inter":   "Dreadwing.jpg",
  "inner_circle_knight": "Inner Circle.jpg",
  "dawnbreaker":       "Dawnbreaker.jpg",
  "dawnbreaker_cohort":"Dawnbreaker.jpg",
  "hibou_khan":        "Hibou Khan.jpg",
  "stormseer":         "Stormseer.jpg",
  "geigor":            "Fell-Hand.jpg",
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
  "maloghurst":        "Maloghurst.jpg",
  "tybalt_marr":       "LunaWolves.jpg",
  "erebus":            "Lorgar.jpg",
  "argel_tal":         "Lorgar.jpg",
  "kor_phaeron":       "Lorgar.jpg",
  "armillus_dynat":    "Alpharius.jpg",
  "exodus_al":         "Alpharius.jpg",
  "ahriman":           "Magnus.jpg",
  "magistus_amon":     "Magnus.jpg",
  "calas_typhon":      "Mortarion.jpg",
  "raldoron":          "Overseer.jpg",
  "dom_zephon":        "Dom_Zephon.jpg",
  "remus_ventanus":    "Guilliman.jpg",
  // ── Dark Angels Named Characters ─────────────────────────────
  "corswain":          "Deathwing.jpg",
  "marduk_sedras":     "Dreadwing.jpg",
  // ── White Scars Named Characters ─────────────────────────────
  "qin_xa":            "Hibou Khan.jpg",
  // ── Space Wolves Named Characters ────────────────────────────
  "hvarl":             "Fell-Hand.jpg",
  "caster_of_runes":   "Cataphratii_2.jpg",
  // ── Imperial Fists Named Characters ──────────────────────────
  "sigismund":         "Champion.jpg",
  "camba_diaz":        "Champion.jpg",
  "fafnir_rann":       "Centurion Terminator.jpg",
  "alexis_polux":      "Centurion Terminator.jpg",
  "evander_garrius":   "Praevian.jpg",
  // ── Blood Angels Named Characters ────────────────────────────
  "aster_crohne":      "Dom_Zephon.jpg",
  // ── Drop Pods ─────────────────────────────────────────────────
  "drop_pod":               "droppod.jpg",
  "dreadnought_drop_pod":   "droppod.jpg",
  "dreadclaw":              "droppod.jpg",
  // ── Vehicles ──────────────────────────────────────────────────
  "kratos":            "kratos.jpg",
  "predator":          "kratos.jpg",
  "leviathan":         "Leviathan Dreadnaught.jpg",
  "contemptor":        "Contemptor Dreadnaught.jpg",
  "deredeo":           "Contemptor Dreadnaught.jpg",
  "saturnine_dread":   "Saturnine Dreadnaught.jpg",
  "rhino":             "Rhino.jpg",
  "damocles_rhino":    "Rhino.jpg",
  "land_raider":       "Rhino.jpg",
  "land_raider_exp":   "Rhino.jpg",
  "spartan":           "Rhino.jpg",
  "sicaran":           "Sicarian.jpg",
  "sicaran_venator":   "Sicarian.jpg",
  "scorpius":          "Sicarian.jpg",
  // ── Flyers ────────────────────────────────────────────────────
  "storm_eagle":       "StormEagle.jpg",
  "fire_raptor":       "Fireraptor.jpg",
  "xiphon":            "Xiphon.jpg",
  // ── Super-Heavies ─────────────────────────────────────────────
  "cerberus":          "Cerberus.jpg",
  "typhon":            "Typhon.jpg",
  "glaive":            "Glaive.jpg",
  "fellblade":         "Fellblade.jpg",
  "falchion":          "Falchion.jpg",
};

// ━━━ FACTION → ARTWORK FILE MAP (used as fallback / faction banner) ━━━━━━━━━
var FACTION_ARTWORK_MAP = {
  "dark_angels":       "legions/Darkangel.jpg",
  "blood_angels":      "legions/Bloodangels.jpg",
  "sons_of_horus":     "legions/LunaWolves.jpg",
  "emperors_children": "legions/Emperorchildren.jpg",
  "iron_warriors":     "legions/Ironwarriors.jpg",
  "white_scars":       "legions/Whitescars.jpg",
  "space_wolves":      "legions/Spacewolves.jpg",
  "imperial_fists":    "legions/Imperialfist.jpg",
  "night_lords":       "legions/Nightlords.jpg",
  "iron_hands":        "legions/Ironhand.jpg",
  "world_eaters":      "legions/Worldeaters.jpg",
  "ultramarines":      "legions/Ultramarines.jpg",
  "death_guard":       "legions/Deathguard.jpg",
  "thousand_sons":     "legions/Thousandsons.jpg",
  "word_bearers":      "legions/wordbearers.jpg",
  "salamanders":       "legions/Salamanders.jpg",
  "raven_guard":       "legions/Ravenguard.jpg",
  "alpha_legion":      "legions/Alphalegion.jpg",
  "custodes":          "legions/Custodes_icon.jpg",
  "mechanicum":        "legions/Mechanicum_icon.jpg",
  "sol_auxilia":       "legions/Solar_Aux_icon.jpg",
};

// ━━━ FACTION × TROOP TYPE ARTWORK MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Used when both factionId AND a troop-class unitId are provided.
// Keys: "factionId:unitId"
// Only tactical-class generics get legion marine art.
// Assault, breacher, despoiler keep their own original artwork.
var TROOP_UNIT_IDS = new Set([
  "tactical","veteran",
  "seeker","heavy_support","tactical_support",
]);
var FACTION_MARINE_MAP = {
  "dark_angels":       "legions/DarkAngel_Marine.jpg",
  "blood_angels":      "legions/Bloodangels_Marine.jpg",
  "sons_of_horus":     "legions/sonsofhorus_marines.jpg",
  "emperors_children": "legions/emperorchildren_marine.jpg",
  "iron_warriors":     "legions/ironwarrior_marine.jpg",
  "white_scars":       "legions/Whitescars_maine.jpg",
  "space_wolves":      "legions/spacewolves_marine.jpg",
  "imperial_fists":    "legions/Imperialfist_Marine.jpg",
  "night_lords":       "legions/Nightlords_marine.jpg",
  "iron_hands":        "legions/ironhand_marine.jpg",
  "world_eaters":      "legions/worldeaters_marine.jpg",
  "ultramarines":      "legions/ultramarine_marine.jpg",
  "death_guard":       "legions/Deathguard_marines.jpg",
  "thousand_sons":     "legions/Thousandsons_marines.jpg",
  "word_bearers":      "legions/wordbearers_marine.jpg",
  "salamanders":       "legions/Salamander_marine.jpg",
  "raven_guard":       "legions/ravenguard_marine.jpg",
  "alpha_legion":      "legions/alphalegion_marines.jpg",
};

// ━━━ HELPER: resolve artwork path ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Files in artwork/legions/ were moved to legions/ at the root level.
// Paths starting with "legions/" are served as-is; everything else gets "artwork/" prepended.
function _artPath(val) {
  if (!val) return null;
  if (val.startsWith("legions/")) return val;
  return "artwork/" + val;
}

function getUnitArtwork(unitId, factionId, allegiance) {
  // 1. Faction-specific marine art for troop units
  if (unitId && factionId && TROOP_UNIT_IDS.has(unitId) && FACTION_MARINE_MAP[factionId]) {
    return _artPath(FACTION_MARINE_MAP[factionId]);
  }
  // 2. Unit-specific art
  if (unitId && UNIT_ARTWORK_MAP[unitId]) {
    return _artPath(UNIT_ARTWORK_MAP[unitId]);
  }
  // 3. Faction banner/fallback art
  if (factionId && FACTION_ARTWORK_MAP[factionId]) {
    return _artPath(FACTION_ARTWORK_MAP[factionId]);
  }
  // 4. Allegiance generic fallback
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
