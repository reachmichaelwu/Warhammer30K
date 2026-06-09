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
  "caladius":          "CustodesCaladiusGravTank1.jpg",
  "caladius_c":        "CustodesCaladiusGravTank1.jpg",
  "pallas_c":          "CustodesCaladiusGravTank1.jpg",
  "contemptor_achillus_c": "CustodesCustodianDreadnought1.jpg",
  "contemptor_galatus_c":  "CustodesCustodianDreadnought1.jpg",
  "telemon_c":         "CustodesCustodianDreadnought1.jpg",
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
  "varagyr":           "Wolf Terminator.jpg",
  "deathsworn":        "Wolf Terminator.jpg",
  "scimitar_jetbike":  "SkyHunter_scimatar.jpg",
  "keshig_rider":      "SkyHunter_scimatar.jpg",
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
  "tybalt_marr":       "legions/LunaWolves.jpg",
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
  // ── Daemons ───────────────────────────────────────────────────
  "daemon_greater":    "Daemons.jpg",
  "daemon_lesser":     "Daemons.jpg",
  // ── Drop Pods ─────────────────────────────────────────────────
  "drop_pod":               "droppod.jpg",
  "dreadnought_drop_pod":   "droppod.jpg",
  "dreadclaw":              "droppod.jpg",
  // ── Vehicles ──────────────────────────────────────────────────
  "vindicator":        "VindicatorSiegeTank.jpg",
  "arquitor":          "HHArquitorBombardMorbusBombard.jpg",
  "kratos":            "Kratos.jpg",
  "predator":          "Predator.jpg",
  "leviathan":         "Leviathan Dreadnaught.jpg",
  "contemptor":        "Contemptor Dreadnaught.jpg",
  "deredeo":           "Contemptor Dreadnaught.jpg",
  "saturnine_dread":   "Saturnine Dreadnaught.jpg",
  "rhino":             "Rhino.jpg",
  "damocles_rhino":    "Rhino.jpg",
  "land_raider":       "Rhino.jpg",
  "land_raider_exp":   "Rhino.jpg",
  "land_speeder":      "LSTankHull.jpg",
  "javelin":           "LSTankHull.jpg",
  "spartan":           "Spartan.jpg",
  "sicaran":           "Sicaran.jpg",
  "sicaran_venator":   "Sicaran.jpg",
  "scorpius":          "HHWhirlwind_Scorpius.jpg",
  // ── Flyers ────────────────────────────────────────────────────
  "storm_eagle":       "StormEagle.jpg",
  "fire_raptor":       "Fireraptor.jpg",
  "xiphon":            "Xiphon.jpg",
  "thunderhawk":       "Thunderhawk.jpg",
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

// ━━━ DERIVED UNIT THUMBNAILS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// The selector contains many variants and legacy units that do not have their
// own bespoke file. These fallbacks choose the closest existing thumbnail by
// unit family, inferred faction, or battlefield role so rows never collapse to
// the abstract icon plate.
var CATEGORY_NUMERAL_FACTION_MAP = {
  "I":    "dark_angels",
  "III":  "emperors_children",
  "IV":   "iron_warriors",
  "V":    "white_scars",
  "VI":   "space_wolves",
  "VII":  "imperial_fists",
  "VIII": "night_lords",
  "IX":   "blood_angels",
  "X":    "iron_hands",
  "XII":  "world_eaters",
  "XIII": "ultramarines",
  "XIV":  "death_guard",
  "XV":   "thousand_sons",
  "XVI":  "sons_of_horus",
  "XVII": "word_bearers",
  "XVIII":"salamanders",
  "XIX":  "raven_guard",
  "XX":   "alpha_legion",
};

var UNIT_ARTWORK_ALIAS_MAP = {
  // Generic Legiones Astartes units.
  "termite":           "droppod.jpg",
  "kharybdis":         "droppod.jpg",
  "recon":             "Seeker.jpg",
  "sabre":             "LSTankHull.jpg",
  "outrider":          "SkyHunter_scimatar.jpg",
  "tarantula":         "Rapier.jpg",

  // Custodes range.
  "valdor_c":          "custodian_guard.jpg",
  "tribune_c":         "custodian_guard.jpg",
  "shield_captain_c":  "custodian_guard.jpg",
  "custodian_guard_c": "custodian_guard.jpg",
  "sentinel_guard_c":  "custodian_guard.jpg",
  "sagittarum":        "custodian_guard.jpg",
  "aquilon":           "Cataphractii Terminator.jpg",
  "aquilon_c":         "Cataphractii Terminator.jpg",
  "venatari_c":        "SkyHunter_scimatar.jpg",
  "gyrfalcon_c":       "SkyHunter_scimatar.jpg",
  "coronus_c":         "CustodesCaladiusGravTank1.jpg",
  "orion_c":           "Fireraptor.jpg",
  "ares_c":            "Fireraptor.jpg",

  // Common Solar Auxilia vehicle families.
  "basilisk_sa":       "HHArquitorBombardMorbusBombard.jpg",
  "medusa_sa":         "HHArquitorBombardMorbusBombard.jpg",
  "aethon_sa":         "LSTankHull.jpg",
  "hermes_light_sa":   "LSTankHull.jpg",
  "hermes_vel_sa":     "LSTankHull.jpg",
  "primaris_lightning_sa": "Xiphon.jpg",
  "thunderbolt_sa":    "Xiphon.jpg",
  "arvus_sa":          "StormEagle.jpg",
  "dracosan_sa":       "Rhino.jpg",
  "leman_russ_strike_sa": "Predator.jpg",
  "leman_russ_assault_sa":"Predator.jpg",
  "malcador_sa":       "Fellblade.jpg",
  "malcador_infernus_sa": "Fellblade.jpg",
  "valdor_sa":         "Falchion.jpg",
  "stormhammer_sa":    "Fellblade.jpg",
};

var ROLE_ARTWORK_FALLBACK_MAP = {
  "warlord":         "Centurion.jpg",
  "high_command":    "Centurion.jpg",
  "command":         "Centurion.jpg",
  "retinue":         "Cataphractii Terminator.jpg",
  "elites":          "Veteran.jpg",
  "troops":          "Tactical.jpg",
  "support":         "Heavy_Support.jpg",
  "war_engine":      "Contemptor Dreadnaught.jpg",
  "heavy_assault":   "Cataphractii Terminator.jpg",
  "transport":       "Rhino.jpg",
  "heavy_transport": "Spartan.jpg",
  "armour":          "Predator.jpg",
  "recon":           "Seeker.jpg",
  "fast_attack":     "SkyHunter_scimatar.jpg",
  "lord_of_war":     "Fellblade.jpg",
  "fortification":   "Rapier.jpg",
};

// ━━━ HELPER: resolve artwork path ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Files in artwork/legions/ were moved to legions/ at the root level.
// Paths starting with "legions/" are served as-is; everything else gets "artwork/" prepended.
function _artPath(val) {
  if (!val) return null;
  if (val.startsWith("legions/")) return val;
  return "artwork/" + val;
}

function _unitCategory(unitId) {
  if (typeof UNIT_CATEGORY_BY_ID !== "undefined" && UNIT_CATEGORY_BY_ID[unitId]) {
    return UNIT_CATEGORY_BY_ID[unitId];
  }
  return "";
}

function _unitName(unitId) {
  if (typeof UNIT_PRESET_BY_ID !== "undefined" && UNIT_PRESET_BY_ID[unitId] && UNIT_PRESET_BY_ID[unitId].name) {
    return UNIT_PRESET_BY_ID[unitId].name;
  }
  return "";
}

function _inferFactionFromCategory(category) {
  if (!category) return null;
  if (category === "SOLAR AUXILIA" || category.indexOf("SA: ") === 0) return "sol_auxilia";
  if (category === "CUSTODES" || category.indexOf("CUSTODES:") === 0) return "custodes";
  if (category.indexOf("MECH:") === 0) return "mechanicum";
  var match = category.match(/^([IVX]+):\s/);
  return match ? (CATEGORY_NUMERAL_FACTION_MAP[match[1]] || null) : null;
}

function _inferFactionForArtwork(unitId) {
  if (typeof UNIT_SPECIFIC_FACTION !== "undefined" && UNIT_SPECIFIC_FACTION[unitId]) {
    return UNIT_SPECIFIC_FACTION[unitId];
  }
  return _inferFactionFromCategory(_unitCategory(unitId));
}

function _unitHaystack(unitId) {
  return [
    unitId || "",
    _unitName(unitId),
    _unitCategory(unitId),
  ].join(" ").toLowerCase();
}

function _inferArtworkByUnitFamily(unitId) {
  if (!unitId) return null;
  if (UNIT_ARTWORK_ALIAS_MAP[unitId]) return UNIT_ARTWORK_ALIAS_MAP[unitId];

  var id = String(unitId).toLowerCase();
  var hay = _unitHaystack(unitId);

  // Command and character variants.
  if (hay.indexOf("librarian") !== -1) return hay.indexOf("terminator") !== -1 ? "Centurion Terminator.jpg" : "Librarian.jpg";
  if (hay.indexOf("chaplain") !== -1) return hay.indexOf("terminator") !== -1 ? "Centurion Terminator.jpg" : "Chaplain.jpg";
  if (hay.indexOf("esoterist") !== -1 || hay.indexOf("diabolist") !== -1) return hay.indexOf("terminator") !== -1 ? "Centurion Terminator.jpg" : "Esoterist.jpg";
  if (hay.indexOf("champion") !== -1 || hay.indexOf("sigismund") !== -1) return hay.indexOf("terminator") !== -1 ? "Centurion Terminator.jpg" : "Champion.jpg";
  if (hay.indexOf("herald") !== -1 || hay.indexOf("delegatus") !== -1 || hay.indexOf("warmonger") !== -1) return hay.indexOf("terminator") !== -1 ? "Centurion Terminator.jpg" : "Centurion.jpg";
  if (hay.indexOf("siege breaker") !== -1 || id.indexOf("siege_breaker") !== -1) return "Siege Breaker.jpg";
  if (hay.indexOf("master of signals") !== -1 || id.indexOf("master_signals") !== -1) return "Master of Signals.jpg";
  if (hay.indexOf("forge lord") !== -1 || hay.indexOf("iron father") !== -1 || hay.indexOf("tech-priest") !== -1) return "Praevian.jpg";
  if (hay.indexOf("primus medicae") !== -1 || hay.indexOf("apothecary") !== -1 || hay.indexOf("medicae") !== -1) return "Centurion.jpg";
  if (hay.indexOf("moritat") !== -1 || hay.indexOf("mortificator") !== -1) return "Vigilator.jpg";
  if (hay.indexOf("praetor") !== -1 || hay.indexOf("praetorian command") !== -1) {
    if (hay.indexOf("scimitar") !== -1 || hay.indexOf("jetbike") !== -1) return "SkyHunter_scimatar.jpg";
    if (hay.indexOf("terminator") !== -1) return "Prateor_Terminator.jpg";
    return "Centurion.jpg";
  }

  // Infantry formations.
  if (/(cataphractii|tartaros|terminator|_term($|_)|justaerin|sek?hmet|deathshroud|grave warden|grave_warden|gorgon|red butcher|red_butcher|phoenix|tyrant siege|tyrant_siege|lernaean|huscarl|morlock|atramentar|dominator|firedrake)/.test(hay)) return "Cataphractii Terminator.jpg";
  if (/(saturnine|phraetus)/.test(hay)) return "Saturnine Terminator.jpg";
  if (/(jetbike|outrider|attack bike|mounted|keshig rider|gyrfalcon)/.test(hay)) return "SkyHunter_scimatar.jpg";
  if (/(jump pack|assault|raptor|dawnbreaker|venatari|locutarus|dark fury|dark_fury|falcon's claws|falcons_claws|ofanim jump|reaver aggressor)/.test(hay)) return "Assualt.jpg";
  if (/(breacher|phalanx|warder|immortal|shield)/.test(hay)) return "Breacher.jpg";
  if (/(destroyer|mortalis|poisoner|red hand|bitter duty|procurator)/.test(hay)) return "Despoiler.jpg";
  if (/(recon|scout|pathfinder|headhunter|mor deythan|mor_deythan|effrit|ammitara|saboteur|firewing)/.test(hay)) return "Seeker.jpg";
  if (/(heavy support|sun killer|sun_killer|iron havoc|havoc|kakophoni|rapier|tarantula|support squad)/.test(hay)) return "Heavy_Support.jpg";
  if (/(palatine|blade|khenetai|rampager|crimson paladin|sanguinary guard|ofanim|invictarus|suzerain|companion|veteran|charmonite|charonite|ogryn|eret?lim)/.test(hay)) return "Veteran.jpg";

  // War engines, walkers, and automata.
  if (/(leviathan)/.test(hay)) return "Leviathan Dreadnaught.jpg";
  if (/(dreadnought|contemptor|castra|rylanor|telemechrus|dracos reborn|osiron|incaendius|mhara gal|mhara_gal)/.test(hay)) return "Contemptor Dreadnaught.jpg";
  if (/(castellax|thanatar|domitar|vorax|arlatax|scyllax|ursarax|echidnax|automata|arcuitor|magos|archmagos|scoria|draykavac|myrmidon)/.test(hay)) return "Araknae.jpg";
  if (/(decimator|blood slaughterer|brass scorpion|kytan|infernus abomination|daemon engine)/.test(hay)) return "Daemons.jpg";

  // Vehicles and flyers.
  if (/(basilisk|medusa|minotaur|artillery)/.test(hay)) return "HHArquitorBombardMorbusBombard.jpg";
  if (/(thunderhawk|aetos dios|marauder|orion|ares|caestus|assault ram|storm eagle|fire raptor|arvus|dropship|fighter|lightning|thunderbolt|avenger)/.test(hay)) return "Xiphon.jpg";
  if (/(baneblade|hellhammer|banehammer|stormlord|stormblade|shadowsword|stormsword|stormhammer|malcador|macharius|crassus|praetor armoured|tormentor|ordinatus)/.test(hay)) return "Fellblade.jpg";
  if (/(falchion|valdor tank|tank destroyer)/.test(hay)) return "Falchion.jpg";
  if (/(cerberus)/.test(hay)) return "Cerberus.jpg";
  if (/(typhon)/.test(hay)) return "Typhon.jpg";
  if (/(glaive)/.test(hay)) return "Glaive.jpg";
  if (/(land raider|spartan|dracosan|triaros|macrocarid|coronus|aurox|transport|conveyor)/.test(hay)) return "Rhino.jpg";
  if (/(drop pod|dreadclaw|kharybdis|termite)/.test(hay)) return "droppod.jpg";
  if (/(sabre|speeder|kyzagan|hermes|sentinel|pallas|javelin)/.test(hay)) return "LSTankHull.jpg";
  if (/(predator|sicaran|vindicator|kratos|leman russ|carnodon|thunderer|cyclops)/.test(hay)) return "Predator.jpg";

  // Fortifications and battlefield emplacements.
  if (/(bunker|redoubt|strongpoint|fortress|defence line|shield generator|landing pad|weapon battery|fortification)/.test(hay)) return "Rapier.jpg";

  return null;
}

function _inferArtworkByRole(unitId) {
  if (typeof UNIT_BATTLEFIELD_ROLE === "undefined") return null;
  var role = UNIT_BATTLEFIELD_ROLE[unitId];
  return role ? ROLE_ARTWORK_FALLBACK_MAP[role] || null : null;
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
  // 3. Closest available thumbnail by unit family.
  var familyArt = _inferArtworkByUnitFamily(unitId);
  if (familyArt) {
    return _artPath(familyArt);
  }
  // 4. Faction banner/fallback art, using either caller faction or category.
  var inferredFaction = unitId ? _inferFactionForArtwork(unitId) : null;
  var fallbackFaction = (factionId && FACTION_ARTWORK_MAP[factionId]) ? factionId : inferredFaction;
  if (fallbackFaction && FACTION_ARTWORK_MAP[fallbackFaction]) {
    return _artPath(FACTION_ARTWORK_MAP[fallbackFaction]);
  }
  // 5. Battlefield-role fallback for generic units.
  var roleArt = _inferArtworkByRole(unitId);
  if (roleArt) {
    return _artPath(roleArt);
  }
  // 6. Allegiance generic fallback
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
