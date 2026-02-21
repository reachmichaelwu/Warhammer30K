import { useState, useCallback, useMemo, useRef } from "react";

// ━━━ GAME DATA & CONSTANTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 3rd Edition BS Table - BS6+ can score Critical Hits
const BS_TO_HIT = { 
  1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 
  6: 2, 7: 2, 8: 2, 9: 2, 10: 2 
};

// Critical Hit thresholds for BS6+ (auto-wounds, bypasses wound roll)
const CRITICAL_HIT_THRESHOLD = {
  6: 6,   // BS6: Critical on 6+
  7: 5,   // BS7: Critical on 5+
  8: 4,   // BS8: Critical on 4+
  9: 3,   // BS9: Critical on 3+
  10: 2   // BS10: Critical on 2+
};

// Strength vs Toughness wound chart
function getWoundRoll(s, t) {
  if (s >= t * 2) return 2;
  if (s > t) return 3;
  if (s === t) return 4;
  if (s <= t / 2) return null; // cannot wound (would need 7+)
  if (s < t) return 5;
  return 6;
}

// Dice roller
function rollD6() { return Math.floor(Math.random() * 6) + 1; }
function rollD6s(n) { return Array.from({ length: n }, () => rollD6()); }

// Weapon types
const WEAPON_TYPES = [
  "Rapid Fire", "Heavy", "Assault", "Pistol", "Salvo", "Ordnance", "Barrage"
];

const SPECIAL_RULES = [
  { id: "twinLinked", label: "Twin-linked", desc: "Re-roll failed To Hit rolls" },
  { id: "shred", label: "Shred", desc: "Re-roll failed To Wound rolls" },
  { id: "rending", label: "Rending", desc: "To Wound of 6 is AP2 and gains +1 Damage" },
  { id: "getshot", label: "Gets Hot! / Overload", desc: "To Hit of 1 causes a wound on the firer (plasma/disintegrators)" },
  { id: "poisoned", label: "Poisoned (4+)", desc: "Always wounds on 4+ (re-roll if S≥T)" },
  { id: "poisoned3", label: "Poisoned (3+)", desc: "Always wounds on 3+ (re-roll if S≥T)" },
  { id: "poisoned2", label: "Poisoned (2+)", desc: "Always wounds on 2+ (re-roll if S≥T)" },
  { id: "ignoresCover", label: "Ignores Cover", desc: "Target cannot take cover saves" },
  { id: "sunder", label: "Sunder", desc: "Re-roll failed Armour Penetration rolls (vehicles)" },
  { id: "pinning", label: "Pinning", desc: "Wounds cause Pinning test (Cool check)" },
  { id: "blast", label: "Blast/Large Blast", desc: "Uses template (hits calculated separately)" },
  { id: "torrent", label: "Torrent", desc: "Template weapon with Torrent range" },
  { id: "precision", label: "Precision Shots", desc: "To Hit of 6 can be allocated by shooter" },
  { id: "breaching", label: "Breaching (4+)", desc: "To Wound of 4+ improves AP by 2 (minimum 2)" },
  { id: "breaching5", label: "Breaching (5+)", desc: "To Wound of 5+ improves AP by 2 (minimum 2)" },
  { id: "breaching6", label: "Breaching (6+)", desc: "To Wound of 6 improves AP by 2 (minimum 2)" },
  { id: "armourbane", label: "Armourbane", desc: "Glancing hits count as Penetrating (vehicles)" },
  { id: "fleshbane", label: "Fleshbane", desc: "Always wounds on 2+" },
  { id: "deflagrate", label: "Deflagrate", desc: "Unsaved wounds cause additional auto-hits" },
  { id: "shellShock", label: "Shell Shock", desc: "-1 to Pinning/Morale checks" },
  { id: "suppressive", label: "Suppressive", desc: "Hits cause Suppressed status (Cool check)" },
  { id: "stun", label: "Stun", desc: "Hits cause Stunned status (Cool check)" },
  { id: "panic", label: "Panic", desc: "Wounds cause Panic status (Cool check)" },
];

// ━━━ UNIT & WEAPON PRESETS (Separated) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const UNIT_PRESETS = [
  { category: "LEGIONES ASTARTES", units: [
    { id: "tactical",         name: "Tactical Squad",           models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "despoiler",        name: "Despoiler Squad",          models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "tactical_support", name: "Tactical Support Squad",   models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "heavy_support",    name: "Heavy Support Squad",      models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "breacher",         name: "Breacher Squad",           models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "6", fnp: "-", ld: 8 },
    { id: "assault",          name: "Assault Squad",            models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "seeker",           name: "Seeker Squad",             models: 5,  bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "recon",            name: "Recon Squad",              models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "4", inv: "-", fnp: "-", ld: 8 },
    { id: "destroyer",        name: "Destroyer Squad",          models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "5", ld: 8 },
  ]},
  { category: "HQ & ELITES", units: [
    { id: "praetor_pa",     name: "Praetor (Power Armour)",   models: 1,  bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "praetor_ta",     name: "Praetor (Terminator)",     models: 1,  bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "praetor_sat",    name: "Praetor (Saturnine)",      models: 1,  bs: 5, t: 5, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "centurion",      name: "Centurion",                models: 1,  bs: 5, t: 4, w: 3, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "champion",       name: "Legion Champion",          models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "master_signals", name: "Master of Signals",        models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "vigilator",      name: "Vigilator",                models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "forge_lord",     name: "Forge Lord",               models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "chaplain",       name: "Legion Chaplain",          models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "librarian",      name: "Legion Librarian",         models: 1,  bs: 4, t: 4, w: 2, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "herald",         name: "Legion Herald",            models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "moritat",        name: "Moritat",                  models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "siege_breaker",  name: "Siege Breaker",            models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "apothecary",     name: "Apothecary",               models: 1,  bs: 4, t: 4, w: 2, sv: "3", inv: "-", fnp: "4", ld: 7 },
    { id: "techmarine",     name: "Techmarine",               models: 1,  bs: 4, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 7 },
    { id: "veteran",        name: "Veteran Tactical Squad",   models: 5,  bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "veteran_assault",name: "Veteran Assault Squad",    models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "TERMINATORS", units: [
    { id: "cataphractii", name: "Cataphractii Terminators", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
    { id: "tartaros",     name: "Tartaros Terminators",    models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "saturnine",    name: "Saturnine Terminators",   models: 3, bs: 4, hasSgt: true, t: 6, w: 3, sv: "2", inv: "4", fnp: "-", ld: 8 },
  ]},
  { category: "VEHICLES & DREADS", units: [
    { id: "contemptor", name: "Contemptor Dreadnought", models: 1, bs: 5, t: 7, w: 7, sv: "2", inv: "5", fnp: "-", ld: 9 },
    { id: "saturnine_dread", name: "Saturnine Dreadnought", models: 1, bs: 5, t: 8, w: 9, sv: "2", inv: "5", fnp: "-", ld: 9 },
    { id: "leviathan", name: "Leviathan Dreadnought", models: 1, bs: 5, t: 8, w: 8, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "deredeo", name: "Deredeo Dreadnought", models: 1, bs: 5, t: 7, w: 7, sv: "2", inv: "5", fnp: "-", ld: 9 },
    { id: "predator", name: "Predator", models: 1, bs: 4, t: 7, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "sicaran", name: "Sicaran", models: 1, bs: 4, t: 7, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "sicaran_venator", name: "Sicaran Venator", models: 1, bs: 4, t: 7, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "vindicator", name: "Vindicator", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "land_raider", name: "Land Raider", models: 1, bs: 4, t: 8, w: 8, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "spartan", name: "Spartan", models: 1, bs: 4, t: 8, w: 9, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "araknae", name: "Araknae Quad Accelerator", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "rapier_la", name: "Rapier Battery (Legiones)", models: 1, bs: 4, t: 6, w: 3, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "SOLAR AUXILIA", units: [
    { id: "lasrifle", name: "Lasrifle Section", models: 20, bs: 3, hasSgt: true, t: 3, w: 1, sv: "4", inv: "-", fnp: "-", ld: 6 },
    { id: "veletaris", name: "Veletaris Storm Section", models: 10, bs: 4, hasSgt: true, t: 3, w: 1, sv: "4", inv: "-", fnp: "-", ld: 7 },
    { id: "rapier", name: "Auxilia Rapier", models: 1, bs: 3, t: 7, w: 3, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "ogryn", name: "Ogryn Charonite", models: 5, bs: 3, t: 5, w: 3, sv: "4", inv: "-", fnp: "5", ld: 7 },
  ]},
  { category: "MECHANICUM", units: [
    { id: "thallax", name: "Thallax Cohort", models: 3, bs: 4, t: 5, w: 2, sv: "4", inv: "-", fnp: "5", ld: 7 },
    { id: "castellax", name: "Castellax Battle-Automata", models: 1, bs: 4, t: 7, w: 4, sv: "3", inv: "-", fnp: "-", ld: 7 },
    { id: "thanatar", name: "Thanatar Siege-Automata", models: 1, bs: 3, t: 8, w: 6, sv: "3", inv: "-", fnp: "-", ld: 7 },
    { id: "tech_thrall", name: "Tech-Thrall Adsecularis", models: 20, bs: 2, t: 3, w: 1, sv: "5", inv: "-", fnp: "6", ld: 5 },
    { id: "myrmidon_dest", name: "Myrmidon Destructor", models: 3, bs: 5, t: 5, w: 3, sv: "2", inv: "-", fnp: "5", ld: 8 },
    { id: "vorax", name: "Vorax Battle-Automata", models: 1, bs: 4, t: 6, w: 4, sv: "3", inv: "-", fnp: "-", ld: 7 },
  ]},
  { category: "CUSTODES", units: [
    { id: "custodian_guard", name: "Custodian Guard", models: 5, bs: 5, t: 5, w: 3, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "sagittarum", name: "Sagittarum Guard", models: 5, bs: 5, t: 5, w: 3, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "aquilon", name: "Aquilon Terminators", models: 3, bs: 5, t: 6, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "caladius", name: "Caladius Grav-Tank", models: 1, bs: 5, t: 7, w: 7, sv: "2", inv: "4", fnp: "-", ld: 10 },
  ]},
  { category: "PRIMARCHS (LOYALIST)", units: [
    { id: "lion", name: "Lion El'Jonson (I)", models: 1, bs: 6, t: 6, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "khan", name: "Jaghatai Khan (V)", models: 1, bs: 5, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "russ", name: "Leman Russ (VI)", models: 1, bs: 5, t: 7, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "dorn", name: "Rogal Dorn (VII)", models: 1, bs: 5, t: 7, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "sanguinius", name: "Sanguinius (IX)", models: 1, bs: 6, t: 6, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "ferrus", name: "Ferrus Manus (X)", models: 1, bs: 5, t: 7, w: 8, sv: "2", inv: "3", fnp: "-", ld: 12 },
    { id: "guilliman", name: "Roboute Guilliman (XIII)", models: 1, bs: 6, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "vulkan", name: "Vulkan (XVIII)", models: 1, bs: 5, t: 7, w: 9, sv: "2", inv: "3", fnp: "-", ld: 12 },
    { id: "corax", name: "Corvus Corax (XIX)", models: 1, bs: 6, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
  ]},
  { category: "PRIMARCHS (TRAITOR)", units: [
    { id: "fulgrim", name: "Fulgrim (III)", models: 1, bs: 6, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "perturabo", name: "Perturabo (IV)", models: 1, bs: 6, t: 7, w: 8, sv: "2", inv: "3", fnp: "-", ld: 12 },
    { id: "curze", name: "Konrad Curze (VIII)", models: 1, bs: 5, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "angron", name: "Angron (XII)", models: 1, bs: 5, t: 7, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "lorgar", name: "Lorgar Aurelian (XVII)", models: 1, bs: 5, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "mortarion", name: "Mortarion (XIV)", models: 1, bs: 5, t: 7, w: 9, sv: "2", inv: "4", fnp: "5", ld: 12 },
    { id: "magnus", name: "Magnus the Red (XV)", models: 1, bs: 6, t: 6, w: 7, sv: "2", inv: "3", fnp: "-", ld: 12 },
    { id: "horus", name: "Horus Lupercal (XVI)", models: 1, bs: 6, t: 7, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "alpharius", name: "Alpharius (XX)", models: 1, bs: 6, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
  ]},
  { category: "DAEMONS", units: [
    { id: "daemon_lesser", name: "Lesser Daemon", models: 10, bs: 3, t: 4, w: 1, sv: "-", inv: "5", fnp: "-", ld: 7 },
    { id: "daemon_greater", name: "Greater Daemon", models: 1, bs: 5, t: 6, w: 6, sv: "-", inv: "4", fnp: "-", ld: 9 },
  ]},
  { category: "FAST ATTACK", units: [
    { id: "xiphon", name: "Xiphon Interceptor", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "storm_eagle", name: "Storm Eagle", models: 1, bs: 4, t: 8, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "fire_raptor", name: "Fire Raptor", models: 1, bs: 4, t: 8, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "scimitar_jetbike", name: "Scimitar Jetbike Squadron", models: 3, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 7 },
    { id: "javelin", name: "Javelin Squadron", models: 1, bs: 4, t: 6, w: 4, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "land_speeder", name: "Land Speeder Squadron", models: 1, bs: 4, t: 5, w: 3, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
];

// ━━━ FOC SLOT CLASSIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Determines which units can take equipment (Vexilla, Nox-Vox, Melta Bombs)
const UNIT_FOC_SLOT = {
  // TROOPS
  tactical: "troops", despoiler: "troops", tactical_support: "troops",
  breacher: "troops", assault: "troops", lasrifle: "troops",
  veletaris: "troops", tech_thrall: "troops",
  // ELITES
  veteran: "elites", veteran_assault: "elites",
  cataphractii: "elites", tartaros: "elites", saturnine: "elites",
  apothecary: "elites", techmarine: "elites",
  custodian_guard: "elites", sagittarum: "elites", aquilon: "elites",
  thallax: "elites", castellax: "elites", myrmidon_dest: "elites",
  ogryn: "elites",
  // HEAVY SUPPORT
  heavy_support: "heavy", contemptor: "heavy", leviathan: "heavy",
  deredeo: "heavy", predator: "heavy", sicaran: "heavy",
  sicaran_venator: "heavy", vindicator: "heavy", land_raider: "heavy",
  spartan: "heavy", araknae: "heavy", rapier_la: "heavy",
  saturnine_dread: "heavy", thanatar: "heavy", rapier: "heavy",
  // FAST ATTACK
  scimitar_jetbike: "fast", javelin: "fast", land_speeder: "fast",
  xiphon: "fast", storm_eagle: "fast", fire_raptor: "fast",
  seeker: "fast", recon: "fast", destroyer: "fast", vorax: "fast",
  // HQ
  praetor_pa: "hq", praetor_ta: "hq", praetor_sat: "hq",
  centurion: "hq", champion: "hq", master_signals: "hq",
  vigilator: "hq", forge_lord: "hq", chaplain: "hq",
  librarian: "hq", herald: "hq", moritat: "hq", siege_breaker: "hq",
};

// Equipment available to Troops and Elites
const EQUIPMENT_OPTIONS = {
  vexilla:  { label: "Vexilla",     cost: 10, desc: "Re-roll failed Morale checks (Shooting & Assault)", icon: "⚑" },
  noxVox:   { label: "Nox-Vox",     cost: 10, desc: "+1 Ld to Leadership & Cooldown checks", icon: "📡" },
  metaBomb: { label: "Melta Bombs", cost: 25, desc: "S8 AP1 Armourbane in assault vs vehicles", icon: "💣" },
};

function canTakeEquipment(unitId) {
  const slot = UNIT_FOC_SLOT[unitId];
  return slot === "troops" || slot === "elites";
}

// ━━━ POINTS COSTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// base: starting cost (includes minimum models per PDF)
// perModel: cost per additional model beyond minimum
// minModels: minimum unit size included in base cost
// weapons: upgrade costs by weapon name (above free/default gear)

const POINTS_DATA = {
  // ── LEGIONES ASTARTES TROOPS ──
  tactical:         { base: 100, perModel: 10, minModels: 10 },
  despoiler:        { base: 100, perModel: 10, minModels: 10 },
  tactical_support: { base: 40,  perModel: 8,  minModels: 5  },
  heavy_support:    { base: 50,  perModel: 10, minModels: 5  },
  breacher:         { base: 140, perModel: 12, minModels: 10 },
  assault:          { base: 140, perModel: 12, minModels: 10 },
  seeker:           { base: 105, perModel: 18, minModels: 5  },
  recon:            { base: 75,  perModel: 15, minModels: 5  },
  destroyer:        { base: 110, perModel: 20, minModels: 5  },
  // ── ELITES ──
  veteran:          { base: 85,  perModel: 15, minModels: 5  },
  veteran_assault:  { base: 120, perModel: 22, minModels: 5  },
  // ── HQ ──
  praetor_pa:       { base: 90,  perModel: 0,  minModels: 1  },
  praetor_ta:       { base: 115, perModel: 0,  minModels: 1  },
  praetor_sat:      { base: 150, perModel: 0,  minModels: 1  },
  centurion:        { base: 80,  perModel: 0,  minModels: 1  },
  champion:         { base: 60,  perModel: 0,  minModels: 1  },
  master_signals:   { base: 70,  perModel: 0,  minModels: 1  },
  vigilator:        { base: 65,  perModel: 0,  minModels: 1  },
  forge_lord:       { base: 65,  perModel: 0,  minModels: 1  },
  chaplain:         { base: 70,  perModel: 0,  minModels: 1  },
  librarian:        { base: 70,  perModel: 0,  minModels: 1  },
  herald:           { base: 45,  perModel: 0,  minModels: 1  },
  moritat:          { base: 65,  perModel: 0,  minModels: 1  },
  siege_breaker:    { base: 55,  perModel: 0,  minModels: 1  },
  apothecary:       { base: 30,  perModel: 0,  minModels: 1  },
  techmarine:       { base: 50,  perModel: 0,  minModels: 1  },
  // ── TERMINATORS ──
  cataphractii:     { base: 150, perModel: 30, minModels: 5  },
  tartaros:         { base: 150, perModel: 30, minModels: 5  },
  saturnine:        { base: 200, perModel: 60, minModels: 3  },
  // ── VEHICLES & DREADS ──
  contemptor:       { base: 155, perModel: 0,  minModels: 1  },
  saturnine_dread:  { base: 210, perModel: 0,  minModels: 1  },
  leviathan:        { base: 260, perModel: 0,  minModels: 1  },
  deredeo:          { base: 185, perModel: 0,  minModels: 1  },
  predator:         { base: 105, perModel: 0,  minModels: 1  },
  sicaran:          { base: 135, perModel: 0,  minModels: 1  },
  sicaran_venator:  { base: 160, perModel: 0,  minModels: 1  },
  vindicator:       { base: 130, perModel: 0,  minModels: 1  },
  land_raider:      { base: 225, perModel: 0,  minModels: 1  },
  spartan:          { base: 360, perModel: 0,  minModels: 1  },
  araknae:          { base: 125, perModel: 0,  minModels: 1  },
  rapier_la:        { base: 40,  perModel: 40, minModels: 1  },
  // ── SOLAR AUXILIA ──
  lasrifle:         { base: 60,  perModel: 3,  minModels: 20 },
  veletaris:        { base: 80,  perModel: 7,  minModels: 10 },
  rapier:           { base: 40,  perModel: 40, minModels: 1  },
  ogryn:            { base: 100, perModel: 20, minModels: 5  },
  // ── MECHANICUM ──
  thallax:          { base: 100, perModel: 30, minModels: 3  },
  myrmidon:         { base: 130, perModel: 40, minModels: 3  },
  // ── CUSTODES ──
  custodian_guard:  { base: 130, perModel: 40, minModels: 3  },
  aquilon:          { base: 165, perModel: 50, minModels: 3  },
};

// Weapon upgrade costs (above free/default wargear) — from Legion Wargear PDF
const WEAPON_UPGRADE_COSTS = {
  // Legion Special Weapons (per model)
  "Flamer": 5, "Plasma Gun (Sustained)": 10, "Plasma Gun (Maximal)": 10,
  "Melta Gun": 15, "Volkite Charger": 5, "Volkite Caliver": 10, "Rotor Cannon": 10,
  // Legion Heavy Weapons (per model)
  "Heavy Bolter": 10, "Heavy Flamer": 10, "Autocannon": 20,
  "Missile Launcher": 15, "Missile L. (Krak)": 15, "Missile L. (Frag)": 15,
  "Multi-Melta": 25, "Plasma Cannon (Sustained)": 20, "Plasma Cannon (Maximal)": 20,
  "Volkite Culverin": 15, "Lascannon": 25,
  // Legion Combi-weapons (per model)
  "Combi-Bolter": 0, "Combi-Flamer": 10, "Combi-Melta": 10,
  "Combi-Plasma (Sustained)": 10, "Combi-Plasma (Maximal)": 10,
  "Combi-Volkite": 10, "Combi-Disintegrator": 10,
  // Legion Pistols
  "Plasma Pistol (Sustained)": 5, "Plasma Pistol (Maximal)": 5,
  "Volkite Serpenta": 5, "Disintegrator Pistol": 5,
  "Archaeotech Pistol": 10, "Hand Flamer": 5,
  // Terminator weapons
  "Reaper Autocannon": 15, "Plasma Blaster (Sustained)": 10, "Plasma Blaster (Maximal)": 10,
  "Heavy Disintegrator": 10, "Twin Heavy Disintegrator": 10,
  "Plasma Bombard (Sustained)": 0, "Plasma Bombard (Maximal)": 0,
  // Disintegrator weapons (Veteran/Seeker specials)
  "Disintegrator Rifle": 5, "Disintegrator Blaster": 10,
  // Breacher specials
  "Graviton Gun": 10, "Lascutter": 10,
  // Vehicle sponson weapons
  "Heavy Bolter Sponsons": 0, "Lascannon Sponsons": 20,
  // Sergeant melee upgrades (from Legion Sergeant Melee Weapons list)
  "Chainsword": 0, "Chainaxe": 0, "Charnabal Sabre": 5,
  "Power Weapon": 10, "Power Fist": 15, "Thunder Hammer": 15, "Lightning Claw": 10,
  // Default/free weapons (no extra cost)
  "Bolter": 0, "Bolt Pistol": 0, "Volkite Charger (Cataphractii)": 0,
  "Combi-Bolter (Tartaros)": 0, "Volkite Charger (default)": 0,
};

// Calculate total points for a deployed unit
function calcUnitPoints(unit) {
  if (!unit.unitData) return null;
  const ud = unit.unitData;
  const pd = POINTS_DATA[ud.id];
  if (!pd) return null;

  // Base cost (includes minimum models)
  let total = pd.base;

  // Extra models beyond minimum
  const extraModels = Math.max(0, ud.models - pd.minModels);
  total += extraModels * pd.perModel;

  // Ranged weapon upgrade cost (per squad model, not sgt)
  if (unit.rangedWeapon) {
    const wCost = WEAPON_UPGRADE_COSTS[unit.rangedWeapon.name] ?? 0;
    const affectedModels = ud.models - (unit.sgtEnabled ? 1 : 0);
    total += wCost * affectedModels;
  }

  // Sergeant weapon upgrade cost (single model)
  if (unit.sgtEnabled && unit.sgtWeapon) {
    const sCost = WEAPON_UPGRADE_COSTS[unit.sgtWeapon.name] ?? 0;
    total += sCost;
  }

  // Equipment costs (Vexilla, Nox-Vox, Melta Bombs)
  if (unit.equipment) {
    if (unit.equipment.vexilla) total += EQUIPMENT_OPTIONS.vexilla.cost;
    if (unit.equipment.noxVox) total += EQUIPMENT_OPTIONS.noxVox.cost;
    if (unit.equipment.metaBomb) total += EQUIPMENT_OPTIONS.metaBomb.cost;
  }

  return total;
}

// Weapons keyed by unit id
const WEAPON_PROFILES = {
  // LEGIONES ASTARTES
  tactical: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Fury of the Legion", shots: 4, s: 4, ap: "5", damage: 1, type: "Heavy", rules: {} },
  ],
  tactical_support: [
    { name: "Plasma Gun (Sustained)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true } },
    { name: "Plasma Gun (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
    { name: "Melta Gun", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Volkite Caliver", shots: 2, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Rotor Cannon", shots: 3, s: 3, ap: "-", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { panic: true, template: true } },
    { name: "Heavy Flamer", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true, template: true } },
  ],
  heavy_support: [
    { name: "Lascannon", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true } },
    { name: "Autocannon", shots: 2, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true } },
    { name: "Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {} },
    { name: "Missile L. (Frag)", shots: 1, s: 4, ap: "6", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Missile L. (Krak)", shots: 1, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
    { name: "Volkite Culverin", shots: 3, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Plasma Cannon (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, breaching6: true } },
    { name: "Plasma Cannon (Maximal)", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, getshot: true, breaching: true } },
    { name: "Multi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { melta: true } },
  ],
  seeker: [
    { name: "Kraken Bolter", shots: 2, s: 4, ap: "4", damage: 1, type: "Bolt", rules: { precision: true, breaching: true } },
    { name: "Nemesis Bolter", shots: 1, s: 4, ap: "5", damage: 1, type: "Heavy", rules: { pinning: true, precision: true, breaching: true } },
  ],
  recon: [
    { name: "Nemesis Bolter", shots: 1, s: 4, ap: "5", damage: 1, type: "Heavy", rules: { pinning: true, precision: true, breaching: true } },
    { name: "Sniper Rifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Heavy", rules: { precision: true, pinning: true } },
  ],
  destroyer: [
    { name: "Rad Missile", shots: 1, s: 4, ap: "3", damage: 1, type: "Assault", rules: { blast: true, fleshbane: true, poisoned: true } },
  ],
  breacher: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Graviton Gun", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, pinning: true }, defaultModels: 2 },
  ],
  despoiler: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  assault: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, defaultModels: 2 },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true }, defaultModels: 2 },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true }, defaultModels: 2 },
  ],
  veteran_assault: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Disintegrator Pistol", shots: 1, s: 4, ap: "3", damage: 2, type: "Pistol", rules: { getshot: true }, defaultModels: 2 },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true }, defaultModels: 2 },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true }, defaultModels: 2 },
  ],
  techmarine: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true } },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
  ],
  // ELITES
  veteran: [
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Plasma Gun (Sustained)", shots: 2, s: 6, ap: "4", damage: 1, type: "Rapid Fire", rules: { breaching6: true } },
    { name: "Plasma Gun (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
    { name: "Melta Gun", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Disintegrator Rifle", shots: 1, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true } },
    { name: "Disintegrator Blaster", shots: 1, s: 5, ap: "2", damage: 2, type: "Assault", rules: { getshot: true }, defaultModels: 2 },
    { name: "Heavy Disintegrator", shots: 1, s: 6, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true }, defaultModels: 2 },
    { name: "Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {}, defaultModels: 2 },
    { name: "Volkite Caliver", shots: 2, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true }, defaultModels: 2 },
    { name: "Missile L. (Krak)", shots: 1, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {}, defaultModels: 2 },
    { name: "Lascannon", shots: 1, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true }, defaultModels: 2 },
    { name: "Autocannon", shots: 2, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, defaultModels: 2 },
  ],
  praetor_pa: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true } },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching: true } },
    { name: "Disintegrator Pistol", shots: 1, s: 4, ap: "3", damage: 2, type: "Pistol", rules: { getshot: true } },
  ],
  praetor_ta: [
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Combi-Plasma (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { getshot: true, breaching: true } },
  ],
  praetor_sat: [
    { name: "Disintegrator Rifle", shots: 2, s: 4, ap: "3", damage: 2, type: "Rapid Fire", rules: { getshot: true } },
    { name: "Heavy Disintegrator", shots: 2, s: 6, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true } },
    { name: "Plasma Bombard", shots: 1, s: 7, ap: "4", damage: 2, type: "Barrage", rules: { blast: true, getshot: true, breaching: true } },
  ],
  champion: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
  ],
  master_signals: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Cognis-Signum (BS boost)", shots: 0, s: 0, ap: "-", damage: 0, type: "Heavy", rules: {} },
  ],
  vigilator: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Nemesis Bolter", shots: 1, s: 5, ap: "5", damage: 1, type: "Heavy", rules: { pinning: true, precision: true } },
  ],
  forge_lord: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
    { name: "Graviton Gun", shots: 1, s: "-", ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
  ],
  chaplain: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
  ],
  librarian: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Force Bolt", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: {} },
  ],
  herald: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
  ],
  moritat: [
    { name: "Dual Bolt Pistols", shots: 2, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Dual Plasma Pistols", shots: 2, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
    { name: "Dual Volkite Serpenta", shots: 4, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
  ],
  siege_breaker: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  // TERMINATORS
  cataphractii: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Combi-Plasma (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Combi-Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { panic: true, template: true } },
    { name: "Heavy Flamer", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true, template: true }, defaultModels: 1 },
    { name: "Reaper Autocannon", shots: 2, s: 6, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true }, defaultModels: 1 },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 6, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, defaultModels: 1 },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { getshot: true, breaching: true }, defaultModels: 1 },
  ],
  tartaros: [
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Plasma Blaster (Sustained)", shots: 2, s: 6, ap: "4", damage: 1, type: "Assault", rules: { breaching6: true }, defaultModels: 1 },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { getshot: true, breaching: true }, defaultModels: 1 },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Combi-Plasma (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
  ],
  saturnine: [
    { name: "Plasma Bombard (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Barrage", rules: { blast: true, breaching6: true } },
    { name: "Plasma Bombard (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Barrage", rules: { blast: true, getshot: true, breaching: true } },
    { name: "Twin Heavy Disintegrator", shots: 2, s: 7, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true }, defaultModels: 1 },
    { name: "Particle Shredder", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: { template: true, breaching6: true }, defaultModels: 1 },
  ],
  // VEHICLES & DREADS
  contemptor: [
    { name: "Kheres Assault Cannon", shots: 5, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { breaching6: true } },
    { name: "Twin Lascannon", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true } },
    { name: "Autocannon (Twin)", shots: 4, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { twinLinked: true, breaching6: true } },
    { name: "Twin Heavy Bolter", shots: 6, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { twinLinked: true } },
    { name: "Volkite Dual-Culverin", shots: 6, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Multi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { melta: true } },
    { name: "Conversion Beam Cannon (<15\")", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beam Cannon (15-30\")", shots: 1, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { blast: true } },
    { name: "Conversion Beam Cannon (>30\")", shots: 1, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { blast: true } },
  ],
  saturnine_dread: [
    { name: "Heavy Plasma Bombard (Sustained)", shots: 1, s: 7, ap: "4", damage: 2, type: "Barrage", rules: { blast: true, breaching6: true } },
    { name: "Heavy Plasma Bombard (Maximal)", shots: 1, s: 8, ap: "4", damage: 2, type: "Barrage", rules: { blast: true, getshot: true, breaching: true } },
    { name: "Disintegrator Cannon", shots: 2, s: 9, ap: "2", damage: 3, type: "Heavy", rules: { getshot: true } },
    { name: "Photonic Incinerator", shots: 1, s: 6, ap: "4", damage: 1, type: "Assault", rules: { panic: true, template: true } },
  ],
  leviathan: [
    { name: "Leviathan Storm Cannon", shots: 4, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching: true } },
    { name: "Cyclonic Melta Lance", shots: 3, s: 8, ap: "2", damage: 3, type: "Heavy", rules: { melta: true } },
    { name: "Siege Claw (ranged)", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: {} },
  ],
  deredeo: [
    { name: "Anvilus Autocannon Battery", shots: 6, s: 8, ap: "4", damage: 2, type: "Heavy", rules: { breaching: true } },
    { name: "Arachnus Heavy Las Battery", shots: 2, s: 9, ap: "2", damage: 4, type: "Heavy", rules: { armourbane: true } },
    { name: "Aiolos Missile Launcher", shots: 1, s: 6, ap: "4", damage: 1, type: "Heavy", rules: { blast: true, barrage: true } },
  ],
  predator: [
    { name: "Predator Cannon (Autocannon)", shots: 3, s: 8, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true } },
    { name: "Lascannon Turret (Twin)", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true } },
    { name: "Lascannon Sponsons x2", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true } },
    { name: "Heavy Bolter Sponsons x2", shots: 6, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {} },
  ],
  sicaran: [
    { name: "Twin Accelerator Autocannon", shots: 6, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true } },
    { name: "Lascannon Sponsons x2", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true } },
    { name: "Heavy Bolter Sponsons x2", shots: 6, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {} },
  ],
  sicaran_venator: [
    { name: "Neutron Laser Beam Cannon", shots: 2, s: 10, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true } },
    { name: "Lascannon Sponsons x2", shots: 2, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true } },
  ],
  vindicator: [
    { name: "Demolisher Cannon", shots: 1, s: 12, ap: "3", damage: 3, type: "Ordnance", rules: { blast: true, breaching: true, stun: true } },
  ],
  land_raider: [
    { name: "Twin Lascannon x2 (sponsons)", shots: 4, s: 9, ap: "2", damage: 1, type: "Heavy", rules: { armourbane: true } },
    { name: "Hull Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {} },
  ],
  spartan: [
    { name: "Lascannon Array x2", shots: 4, s: 9, ap: "2", damage: 3, type: "Heavy", rules: { armourbane: true } },
    { name: "Hull Heavy Bolter", shots: 3, s: 5, ap: "4", damage: 1, type: "Heavy", rules: {} },
    { name: "Havoc Launcher (opt)", shots: 1, s: 5, ap: "5", damage: 1, type: "Heavy", rules: { blast: true } },
  ],
  araknae: [
    { name: "Quad Accelerator Autocannon", shots: 10, s: 7, ap: "4", damage: 2, type: "Heavy", rules: { breaching6: true } },
  ],
  rapier_la: [
    { name: "Gravis Heavy Bolter Battery", shots: 8, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Laser Destroyer", shots: 2, s: 10, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true } },
    { name: "Graviton Cannon", shots: 1, s: 8, ap: "3", damage: 1, type: "Heavy", rules: { blast: true, pinning: true, breaching6: true } },
    { name: "Quad Launcher (Frag)", shots: 1, s: 5, ap: "5", damage: 1, type: "Heavy", rules: { blast: true, barrage: true } },
    { name: "Quad Launcher (Shatter)", shots: 4, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { armourbane: true } },
  ],
  // SOLAR AUXILIA
  lasrifle: [
    { name: "Lasrifle", shots: 1, s: 3, ap: "6", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  veletaris: [
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
  ],
  rapier: [
    { name: "Laser Destroyer", shots: 2, s: 10, ap: "2", damage: 2, type: "Heavy", rules: { armourbane: true } },
  ],
  // MECHANICUM
  thallax: [
    { name: "Lightning Locks", shots: 3, s: 7, ap: "5", damage: 1, type: "Assault", rules: { rending: true, shred: true } },
  ],
  castellax: [
    { name: "Mauler Bolt Cannon", shots: 3, s: 6, ap: "3", damage: 1, type: "Heavy", rules: { pinning: true } },
    { name: "Darkfire Cannon", shots: 2, s: 7, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true } },
  ],
  thanatar: [
    { name: "Plasma Mortar", shots: 1, s: 8, ap: "2", damage: 2, type: "Barrage", rules: { blast: true, getshot: true, breaching: true } },
  ],
  // CUSTODES
  custodian_guard: [
    { name: "Guardian Spear (shooting)", shots: 2, s: 4, ap: "3", damage: 1, type: "Assault", rules: {} },
  ],
  sagittarum: [
    { name: "Adrastus Bolt Caliver", shots: 3, s: 5, ap: "3", damage: 1, type: "Heavy", rules: { breaching6: true } },
  ],
  aquilon: [
    { name: "Twin Adrathic Destructor", shots: 2, s: 5, ap: "2", damage: 2, type: "Assault", rules: { twinLinked: true } },
  ],
  caladius: [
    { name: "Iliastus Accelerator", shots: 3, s: 7, ap: "3", damage: 2, type: "Heavy", rules: { rending: true } },
  ],
  // New units (basic defaults)
  centurion: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Combi-Plasma", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
  ],
  apothecary: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true } },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
  ],
  ogryn: [
    { name: "Laspistol", shots: 1, s: 3, ap: "6", damage: 1, type: "Pistol", rules: {} },
  ],
  tech_thrall: [
    { name: "Laslock", shots: 1, s: 3, ap: "6", damage: 1, type: "Assault", rules: {} },
    { name: "Mitra-Lock", shots: 2, s: 3, ap: "6", damage: 1, type: "Assault", rules: {} },
  ],
  myrmidon_dest: [
    { name: "Volkite Culverin", shots: 4, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Irradiation Engine", shots: 1, s: 4, ap: "3", damage: 1, type: "Heavy", rules: { fleshbane: true, blast: true } },
    { name: "Photon Thruster", shots: 2, s: 6, ap: "2", damage: 2, type: "Heavy", rules: { getshot: true } },
  ],
  vorax: [
    { name: "Rotor Cannon x2", shots: 8, s: 3, ap: "6", damage: 1, type: "Salvo", rules: { suppressive: true } },
    { name: "Lightning Gun", shots: 3, s: 7, ap: "5", damage: 1, type: "Assault", rules: { rending: true, shred: true } },
  ],
  // PRIMARCHS (LOYALIST)
  lion: [
    { name: "Fusil Actinaeus (Plasma)", shots: 2, s: 7, ap: "2", damage: 2, type: "Pistol", rules: { breaching: true } },
  ],
  khan: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  russ: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  dorn: [
    { name: "Voice of Terra", shots: 4, s: 6, ap: "3", damage: 2, type: "Assault", rules: { pinning: true } },
  ],
  sanguinius: [
    { name: "Infernus Pistol", shots: 1, s: 8, ap: "1", damage: 2, type: "Pistol", rules: {} },
  ],
  ferrus: [
    { name: "Graviton Imploder", shots: 1, s: 8, ap: "2", damage: 2, type: "Assault", rules: {} },
    { name: "Plasma Imploder", shots: 2, s: 7, ap: "2", damage: 2, type: "Assault", rules: { breaching: true, getshot: true } },
  ],
  guilliman: [
    { name: "Arbitrator (Combi)", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
  ],
  vulkan: [
    { name: "Furnace's Heart (Beam)", shots: 1, s: 8, ap: "1", damage: 2, type: "Assault", rules: { panic: true } },
    { name: "Furnace's Heart (Flame)", shots: 1, s: 6, ap: "3", damage: 1, type: "Assault", rules: { panic: true } },
  ],
  corax: [
    { name: "Panoply of the Raven (Archeotech)", shots: 2, s: 6, ap: "3", damage: 1, type: "Assault", rules: {} },
  ],
  // PRIMARCHS (TRAITOR)
  fulgrim: [
    { name: "Fireblade (Volkite)", shots: 4, s: 6, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
  ],
  perturabo: [
    { name: "Logos (Wrist Guns)", shots: 4, s: 7, ap: "3", damage: 2, type: "Assault", rules: {} },
    { name: "Logos (Missile)", shots: 1, s: 8, ap: "2", damage: 2, type: "Heavy", rules: { blast: true } },
  ],
  curze: [
    { name: "Mercy & Forgiveness (Thrown)", shots: 2, s: 5, ap: "3", damage: 1, type: "Assault", rules: {} },
  ],
  angron: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
  ],
  lorgar: [
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "3", damage: 1, type: "Pistol", rules: {} },
  ],
  mortarion: [
    { name: "The Lantern (Beam)", shots: 2, s: 8, ap: "2", damage: 2, type: "Assault", rules: { sunder: true } },
  ],
  magnus: [
    { name: "Psychic Bolt", shots: 3, s: 8, ap: "2", damage: 2, type: "Assault", rules: {} },
  ],
  horus: [
    { name: "Warmaster's Combi (Bolter)", shots: 4, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Warmaster's Combi (Disintegrator)", shots: 1, s: 5, ap: "2", damage: 2, type: "Assault", rules: { getshot: true } },
  ],
  alpharius: [
    { name: "Pale Spear (Ranged)", shots: 2, s: 6, ap: "2", damage: 2, type: "Assault", rules: {} },
  ],
  daemon_lesser: [
    { name: "Warp Bolt", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: {} },
  ],
  daemon_greater: [
    { name: "Warp Flame", shots: 3, s: 6, ap: "3", damage: 2, type: "Assault", rules: {} },
  ],
  // FAST ATTACK
  xiphon: [
    { name: "Twin Lascannon x2", shots: 4, s: 9, ap: "2", damage: 2, type: "Heavy", rules: { twinLinked: true } },
    { name: "Rotary Missile Launcher", shots: 3, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
  ],
  storm_eagle: [
    { name: "Twin Heavy Bolter", shots: 6, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { twinLinked: true, suppressive: true } },
    { name: "Vengeance Launcher", shots: 2, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Tempest Rockets x4", shots: 4, s: 6, ap: "4", damage: 1, type: "Heavy", rules: {} },
    { name: "Twin Multi-Melta (opt)", shots: 2, s: 8, ap: "1", damage: 3, type: "Heavy", rules: { twinLinked: true } },
    { name: "Cyclone Missile L. (opt)", shots: 2, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
    { name: "Hunter-Killer Missiles x4 (opt)", shots: 4, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
    { name: "Twin Lascannon x2 (opt)", shots: 4, s: 9, ap: "2", damage: 2, type: "Heavy", rules: { twinLinked: true } },
  ],
  fire_raptor: [
    { name: "Twin Avenger Bolt Cannon", shots: 7, s: 6, ap: "3", damage: 1, type: "Heavy", rules: { twinLinked: true } },
    { name: "Gravis Heavy Bolter Sponsons x2", shots: 8, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Tempest Rockets x4", shots: 4, s: 6, ap: "4", damage: 1, type: "Heavy", rules: {} },
    { name: "Gravis Autocannon Sponsons (opt)", shots: 4, s: 7, ap: "4", damage: 1, type: "Heavy", rules: {} },
    { name: "Hellstrike Missiles x4 (opt)", shots: 4, s: 8, ap: "2", damage: 2, type: "Heavy", rules: {} },
  ],
  scimitar_jetbike: [
    { name: "Heavy Bolter", shots: 4, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Volkite Culverin (opt)", shots: 4, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Multi-Melta (opt)", shots: 1, s: 8, ap: "1", damage: 3, type: "Heavy", rules: {} },
    { name: "Plasma Cannon (opt)", shots: 1, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { getshot: true, breaching: true, blast: true } },
  ],
  javelin: [
    { name: "Heavy Bolter", shots: 4, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Cyclone Missile L.", shots: 2, s: 8, ap: "3", damage: 1, type: "Heavy", rules: {} },
    { name: "Two Heavy Flamers (opt)", shots: 2, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true } },
    { name: "Two Heavy Bolters (opt)", shots: 8, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Two Lascannon (opt)", shots: 2, s: 9, ap: "2", damage: 2, type: "Heavy", rules: {} },
    { name: "Two Volkite Culverin (opt)", shots: 8, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
  ],
  land_speeder: [
    { name: "Heavy Bolter", shots: 4, s: 5, ap: "4", damage: 1, type: "Heavy", rules: { suppressive: true } },
    { name: "Heavy Flamer (opt)", shots: 1, s: 5, ap: "4", damage: 1, type: "Assault", rules: { panic: true } },
    { name: "Havoc Launcher (opt)", shots: 1, s: 5, ap: "5", damage: 1, type: "Heavy", rules: { blast: true } },
    { name: "Multi-Melta (opt)", shots: 1, s: 8, ap: "1", damage: 3, type: "Heavy", rules: {} },
    { name: "Volkite Culverin (opt)", shots: 4, s: 6, ap: "5", damage: 1, type: "Heavy", rules: { deflagrate: true } },
    { name: "Plasma Cannon (opt)", shots: 1, s: 7, ap: "4", damage: 1, type: "Heavy", rules: { getshot: true, breaching: true, blast: true } },
    { name: "Graviton Gun (opt)", shots: 1, s: "-", ap: "4", damage: 1, type: "Heavy", rules: { blast: true } },
  ],
};

// Sergeant weapon options keyed by unit category
// The sergeant replaces 1 model from the squad and fires a different weapon
const SERGEANT_WEAPONS = {
  // Standard Astartes sergeants
  astartes: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true } },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Combi-Plasma (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Combi-Volkite", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Combi-Flamer", shots: 1, s: 4, ap: "5", damage: 1, type: "Assault", rules: { panic: true, template: true } },
    { name: "Hand Flamer", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: { template: true } },
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching: true } },
  ],
  // Terminator sergeants
  terminator: [
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Combi-Plasma (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Combi-Volkite", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Volkite Charger", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Plasma Blaster (Maximal)", shots: 2, s: 7, ap: "4", damage: 1, type: "Assault", rules: { getshot: true, breaching: true } },
  ],
  // Solar Auxilia sergeants (Troop Commanders)
  auxilia: [
    { name: "Laspistol", shots: 1, s: 3, ap: "6", damage: 1, type: "Pistol", rules: {} },
    { name: "Blast Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: { getshot: true } },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
    { name: "Plasma Pistol", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
  ],
  // Veteran sergeants (same as astartes but higher BS baked in from unit)
  veteran: [
    { name: "Bolt Pistol", shots: 1, s: 4, ap: "5", damage: 1, type: "Pistol", rules: {} },
    { name: "Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Plasma Pistol (Sustained)", shots: 1, s: 6, ap: "4", damage: 1, type: "Pistol", rules: { breaching6: true } },
    { name: "Plasma Pistol (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Pistol", rules: { getshot: true, breaching: true } },
    { name: "Volkite Serpenta", shots: 2, s: 5, ap: "5", damage: 1, type: "Pistol", rules: { deflagrate: true } },
    { name: "Combi-Bolter", shots: 2, s: 4, ap: "5", damage: 1, type: "Rapid Fire", rules: {} },
    { name: "Combi-Plasma (Maximal)", shots: 1, s: 7, ap: "4", damage: 1, type: "Rapid Fire", rules: { getshot: true, breaching: true } },
    { name: "Combi-Melta", shots: 1, s: 8, ap: "2", damage: 3, type: "Assault", rules: { melta: true } },
    { name: "Combi-Volkite", shots: 2, s: 5, ap: "5", damage: 1, type: "Assault", rules: { deflagrate: true } },
    { name: "Hand Flamer", shots: 1, s: 3, ap: "-", damage: 1, type: "Pistol", rules: { template: true } },
    { name: "Disintegrator Pistol", shots: 1, s: 4, ap: "3", damage: 2, type: "Pistol", rules: { getshot: true } },
    { name: "Archaeotech Pistol", shots: 1, s: 6, ap: "4", damage: 2, type: "Pistol", rules: { breaching: true } },
  ],
};

// Map unit id to sergeant weapon category
function getSgtCategory(unitId) {
  if (!unitId) return null;
  if (["cataphractii","tartaros","saturnine"].includes(unitId)) return "terminator";
  if (["lasrifle","veletaris"].includes(unitId)) return "auxilia";
  if (unitId === "veteran") return "veteran";
  if (["tactical","tactical_support","heavy_support","seeker","recon","destroyer","breacher","assault","despoiler","veteran_assault","scimitar_jetbike"].includes(unitId)) return "astartes";
  return null;
}

// Target presets now use the same UNIT_PRESETS — no separate list needed.
// The UnitSelectorModal shows defensive stats when isTarget=true.

// ━━━ PHASE RESOLVER ENGINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function resolveShootingPhase(params) {
  const {
    numModels, numShots, bs, strength, ap, toughness,
    armourSave, invulnSave, coverSave, fnp,
    specialRules, halfRange, moved, indirect, weaponType,
    leadership, targetModels,
    sgtEnabled, sgtWeapon,
    hasVexilla, hasNoxVox
  } = params;

  const log = [];
  const rolls = { hit: [], wound: [], save: [], fnpRolls: [] };
  let getsHotWounds = 0;
  let precisionHits = 0;
  let deflagrateHits = 0;
  let criticalHitWounds = 0;

  // ━━ STEP 0: Calculate total shots ━━
  const hasSgt = sgtEnabled && sgtWeapon;
  const squadModels = hasSgt ? Math.max(numModels - 1, 0) : numModels;
  let totalShots = squadModels * numShots;
  
  if (hasSgt) {
    log.push({ phase: "Setup", text: `${squadModels} squad model(s) firing ${numShots} shot(s) each + 1 Sergeant with ${sgtWeapon.name}` });
  } else {
    log.push({ phase: "Setup", text: `${numModels} model(s) firing ${numShots} shot(s) each = ${totalShots} total shots` });
  }

  // Rapid Fire at half range doubles shots
  if (weaponType === "Rapid Fire" && halfRange) {
    totalShots = squadModels * numShots * 2;
    log.push({ phase: "Setup", text: `Rapid Fire at half range: doubled to ${totalShots} shots` });
  }

  // ━━ STEP 1: Roll to Hit ━━
  let toHitNeeded = BS_TO_HIT[bs] || 6;
  log.push({ phase: "To Hit", text: `BS ${bs} → needs ${toHitNeeded}+ to hit` });

  // Modifiers
  let hitMods = [];
  // Snap Shots for Heavy weapons that moved - 3rd edition: scales with BS
  let snapShooting = false;
  if (weaponType === "Heavy" && moved) {
    snapShooting = true;
    // 3rd Edition Snap Fire: BS1-3=6+, BS4-5=5+, BS6-7=4+, BS8+=3+
    if (bs <= 3) toHitNeeded = 6;
    else if (bs <= 5) toHitNeeded = 5;
    else if (bs <= 7) toHitNeeded = 4;
    else toHitNeeded = 3;
    hitMods.push(`Snap Shots (moved with Heavy weapon): hits on ${toHitNeeded}+ (scales with BS)`);
  }
  // Barrage indirect fire
  if (weaponType === "Barrage" && indirect) {
    snapShooting = true;
    if (bs <= 3) toHitNeeded = 6;
    else if (bs <= 5) toHitNeeded = 5;
    else if (bs <= 7) toHitNeeded = 4;
    else toHitNeeded = 3;
    hitMods.push(`Barrage (Indirect Fire): firing without LoS, hits on ${toHitNeeded}+`);
  }
  // Barrage moved (Ordnance-type, cannot fire if moved unless specified)
  if (weaponType === "Barrage" && moved && !indirect) {
    snapShooting = true;
    if (bs <= 3) toHitNeeded = 6;
    else if (bs <= 5) toHitNeeded = 5;
    else if (bs <= 7) toHitNeeded = 4;
    else toHitNeeded = 3;
    hitMods.push(`Snap Shots (moved with Barrage weapon): hits on ${toHitNeeded}+`);
  }
  if (hitMods.length > 0) {
    log.push({ phase: "To Hit", text: `Modifiers: ${hitMods.join(", ")}` });
  }
  // Barrage inherently has Pinning
  if (weaponType === "Barrage") {
    log.push({ phase: "Setup", text: `Barrage: weapon has inherent Pinning` });
  }

  let hitRolls = rollD6s(totalShots);
  rolls.hit = hitRolls.map(r => ({ value: r, success: r >= toHitNeeded }));

  // 3rd Edition Critical Hits - BS6+ can score critical hits that auto-wound
  let criticalHits = 0;
  if (bs >= 6 && !snapShooting && CRITICAL_HIT_THRESHOLD[bs]) {
    const critThreshold = CRITICAL_HIT_THRESHOLD[bs];
    criticalHits = hitRolls.filter(r => r >= critThreshold).length;
    if (criticalHits > 0) {
      log.push({ phase: "To Hit", text: `⚡ Critical Hits (BS${bs}): ${criticalHits} roll(s) of ${critThreshold}+ auto-wound and bypass wound roll!` });
    }
  }

  // Gets Hot check
  if (specialRules.getshot) {
    const onesCount = hitRolls.filter(r => r === 1).length;
    if (onesCount > 0) {
      getsHotWounds = onesCount;
      log.push({ phase: "To Hit", text: `⚠ Gets Hot! ${onesCount} roll(s) of 1 → ${onesCount} wound(s) on the firing unit!` });
    }
  }

  let hits = hitRolls.filter(r => r >= toHitNeeded).length;

  // Precision Shots
  if (specialRules.precision && !snapShooting) {
    precisionHits = hitRolls.filter(r => r === 6).length;
    if (precisionHits > 0) {
      log.push({ phase: "To Hit", text: `🎯 Precision Shots: ${precisionHits} hit(s) rolled 6 → can be allocated by shooter` });
    }
  }

  // Twin-linked re-rolls
  let rerollHits = 0;
  if (specialRules.twinLinked) {
    const misses = hitRolls.filter(r => r < toHitNeeded);
    const rerolls = rollD6s(misses.length);
    rerollHits = rerolls.filter(r => r >= toHitNeeded).length;
    hits += rerollHits;
    rolls.hit.push(...rerolls.map(r => ({ value: r, success: r >= toHitNeeded, reroll: true })));
    log.push({ phase: "To Hit", text: `Twin-linked: re-rolled ${misses.length} miss(es) → ${rerollHits} additional hit(s)` });
  }

  log.push({ phase: "To Hit", text: `Result: ${hits} hit(s) from ${totalShots} shot(s)` });

  if (hits === 0) {
    log.push({ phase: "Result", text: "No hits scored. Shooting resolved." });
    return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds: 0, unsaved: 0, deflagrateHits: 0, criticalHitWounds: 0, statusEffects: [], ldRolls: [] };
  }

  // ━━ STEP 2: Roll to Wound ━━
  let toWoundNeeded;
  let poisonedValue = null;

  if (specialRules.fleshbane) {
    toWoundNeeded = 2;
    log.push({ phase: "To Wound", text: `Fleshbane: always wounds on 2+` });
  } else if (specialRules.poisoned) {
    poisonedValue = 4;
    toWoundNeeded = 4;
    log.push({ phase: "To Wound", text: `Poisoned (4+): wounds on 4+ (S${strength} vs T${toughness})` });
  } else if (specialRules.poisoned3) {
    poisonedValue = 3;
    toWoundNeeded = 3;
    log.push({ phase: "To Wound", text: `Poisoned (3+): wounds on 3+ (S${strength} vs T${toughness})` });
  } else if (specialRules.poisoned2) {
    poisonedValue = 2;
    toWoundNeeded = 2;
    log.push({ phase: "To Wound", text: `Poisoned (2+): wounds on 2+ (S${strength} vs T${toughness})` });
  } else {
    toWoundNeeded = getWoundRoll(strength, toughness);
    if (toWoundNeeded === null) {
      log.push({ phase: "To Wound", text: `S${strength} vs T${toughness}: Cannot wound! (would need 7+)` });
      log.push({ phase: "Result", text: "No wounds possible. Shooting resolved." });
      return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds: 0, unsaved: 0, deflagrateHits: 0, criticalHitWounds: 0, statusEffects: [], ldRolls: [] };
    }
    log.push({ phase: "To Wound", text: `S${strength} vs T${toughness} → needs ${toWoundNeeded}+ to wound` });
  }

  // 3rd Edition: Critical hits auto-wound, only roll for regular hits
  let regularHitsToWound = hits - criticalHits;
  criticalHitWounds = criticalHits;
  
  let woundRolls = regularHitsToWound > 0 ? rollD6s(regularHitsToWound) : [];
  let wounds = criticalHits; // Start with auto-wounds from critical hits
  let rendingWounds = 0;
  let breachingWounds = 0;
  let normalWounds = 0;
  let criticalWounds = criticalHits;

  // Track each wound roll
  const woundResults = woundRolls.map(r => {
    const success = r >= toWoundNeeded;
    let rending = false;
    let breaching = false;

    if (success) {
      if (specialRules.rending && r === 6) {
        rending = true;
        rendingWounds++;
      } else if ((specialRules.breaching && r >= 4) || (specialRules.breaching5 && r >= 5) || (specialRules.breaching6 && r === 6)) {
        breaching = true;
        breachingWounds++;
      } else {
        normalWounds++;
      }
    }

    return { value: r, success, rending, breaching };
  });

  wounds = woundResults.filter(r => r.success).length;
  rolls.wound = woundResults;

  // Shred re-rolls
  let rerollWounds = 0;
  if (specialRules.shred && regularHitsToWound > 0) {
    const woundMisses = woundResults.filter(r => !r.success);
    const rerolls = rollD6s(woundMisses.length);
    rerolls.forEach(r => {
      const success = r >= toWoundNeeded;
      if (success) {
        rerollWounds++;
        wounds++;
        if (specialRules.rending && r === 6) rendingWounds++;
        else if ((specialRules.breaching && r >= 4) || (specialRules.breaching5 && r >= 5) || (specialRules.breaching6 && r === 6)) breachingWounds++;
        else normalWounds++;
      }
      rolls.wound.push({ value: r, success, reroll: true });
    });
    log.push({ phase: "To Wound", text: `Shred: re-rolled ${woundMisses.length} failed wound(s) → ${rerollWounds} additional wound(s)` });
  }

  // Poisoned re-rolls (if S >= T)
  if (poisonedValue && strength >= toughness && regularHitsToWound > 0) {
    const woundMisses = woundResults.filter(r => !r.success);
    const rerolls = rollD6s(woundMisses.length);
    let poisonRerolls = 0;
    rerolls.forEach(r => {
      if (r >= poisonedValue) { poisonRerolls++; wounds++; normalWounds++; }
      rolls.wound.push({ value: r, success: r >= poisonedValue, reroll: true });
    });
    if (poisonRerolls > 0) {
      log.push({ phase: "To Wound", text: `Poison re-roll (S≥T): ${poisonRerolls} additional wound(s)` });
    }
  }

  if (specialRules.rending && rendingWounds > 0) {
    log.push({ phase: "To Wound", text: `🗡 Rending: ${rendingWounds} wound(s) at AP2 (rolled 6)` });
    normalWounds = wounds - rendingWounds - breachingWounds;
  }
  if (breachingWounds > 0) {
    const bLabel = specialRules.breaching ? "4+" : specialRules.breaching5 ? "5+" : "6+";
    log.push({ phase: "To Wound", text: `💥 Breaching (${bLabel}): ${breachingWounds} wound(s) at AP2` });
    normalWounds = wounds - rendingWounds - breachingWounds;
  }

  log.push({ phase: "To Wound", text: `Result: ${wounds} wound(s) from ${hits} hit(s)` });

  if (wounds === 0) {
    log.push({ phase: "Result", text: "No wounds scored. Shooting resolved." });
    return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds, unsaved: 0, deflagrateHits: 0, statusEffects: [], ldRolls: [] };
  }

  // ━━ STEP 3: Saving Throws ━━
  // Determine effective save for each wound type
  let unsavedWounds = 0;

  function resolveSaves(count, effectiveAP, label) {
    if (count === 0) return 0;

    // Determine best save
    let bestSave = null;
    let saveType = "";

    // Armour save (negated if AP <= save value)
    const armourNegated = effectiveAP !== "-" && effectiveAP !== null && parseInt(effectiveAP) <= parseInt(armourSave);
    if (!armourNegated && armourSave && armourSave !== "-" && armourSave !== "0") {
      bestSave = parseInt(armourSave);
      saveType = `${armourSave}+ Armour`;
    }

    // Cover save (if not ignoring cover)
    if (!specialRules.ignoresCover && coverSave && coverSave !== "-" && coverSave !== "0") {
      const cv = parseInt(coverSave);
      if (bestSave === null || cv < bestSave) {
        bestSave = cv;
        saveType = `${cv}+ Cover`;
      }
    }

    // Invulnerable save (never negated by AP)
    if (invulnSave && invulnSave !== "-" && invulnSave !== "0") {
      const iv = parseInt(invulnSave);
      if (bestSave === null || iv < bestSave) {
        bestSave = iv;
        saveType = `${iv}+ Invulnerable`;
      }
    }

    if (bestSave === null) {
      log.push({ phase: "Saves", text: `${label}: ${count} wound(s) — No save available! All wounds unsaved.` });
      return count;
    }

    log.push({ phase: "Saves", text: `${label}: ${count} wound(s) — saving on ${saveType} (AP ${effectiveAP || "-"})` });

    const saveRolls = rollD6s(count);
    const saved = saveRolls.filter(r => r >= bestSave).length;
    const unsaved = count - saved;
    rolls.save.push(...saveRolls.map(r => ({ value: r, success: r >= bestSave, needed: bestSave })));
    log.push({ phase: "Saves", text: `  Rolled: [${saveRolls.join(", ")}] → ${saved} saved, ${unsaved} unsaved` });
    return unsaved;
  }

  // Normal wounds at weapon AP
  normalWounds = wounds - rendingWounds - breachingWounds;
  unsavedWounds += resolveSaves(normalWounds, ap, "Normal wounds");

  // Rending wounds at AP2
  if (rendingWounds > 0) {
    unsavedWounds += resolveSaves(rendingWounds, "2", "Rending wounds (AP2)");
  }

  // Breaching wounds at AP2
  if (breachingWounds > 0) {
    unsavedWounds += resolveSaves(breachingWounds, "2", "Breaching wounds (AP2)");
  }

  log.push({ phase: "Saves", text: `Result: ${unsavedWounds} unsaved wound(s)` });

  if (unsavedWounds === 0) {
    log.push({ phase: "Result", text: "All wounds saved. No casualties." });
    return { log, rolls, casualties: 0, getsHotWounds, precisionHits, totalShots, hits, wounds, unsaved: 0, deflagrateHits: 0, statusEffects: [], ldRolls: [] };
  }

  // ━━ STEP 4: Feel No Pain ━━
  let casualties = unsavedWounds;
  if (fnp && fnp !== "-" && fnp !== "0") {
    const fnpNeeded = parseInt(fnp);
    // FNP doesn't work against Instant Death (S >= 2x Toughness) or AP1/AP2 in some editions
    // In HH 3rd ed, FNP works against everything except Instant Death and Destroyer
    const instantDeath = strength >= toughness * 2; // 3rd Ed: No "Instant Death" rule, just high damage
    if (instantDeath) {
      log.push({ phase: "FNP", text: `Instant Death — Feel No Pain cannot be used!` });
    } else {
      log.push({ phase: "FNP", text: `Feel No Pain (${fnpNeeded}+): rolling for ${unsavedWounds} unsaved wound(s)` });
      const fnpRolls = rollD6s(unsavedWounds);
      const fnpSaved = fnpRolls.filter(r => r >= fnpNeeded).length;
      casualties = unsavedWounds - fnpSaved;
      rolls.fnpRolls = fnpRolls.map(r => ({ value: r, success: r >= fnpNeeded }));
      log.push({ phase: "FNP", text: `Rolled: [${fnpRolls.join(", ")}] → ${fnpSaved} saved, ${casualties} casualties` });
    }
  }

  // ━━ STEP 5: Deflagrate ━━
  if (specialRules.deflagrate && casualties > 0) {
    deflagrateHits = casualties;
    log.push({ phase: "Special", text: `🔥 Deflagrate: ${casualties} unsaved wound(s) generate ${casualties} additional automatic hit(s)!` });
    log.push({ phase: "Special", text: `(Resolve Deflagrate hits separately with the same weapon profile)` });
  }

  // ━━ STEP 5b: Sergeant's Weapon ━━
  let sgtHits = 0, sgtWounds = 0, sgtUnsaved = 0, sgtCasualties = 0;
  if (hasSgt) {
    log.push({ phase: "Sergeant", text: `⚔ Sergeant fires ${sgtWeapon.name} (${sgtWeapon.type} ${sgtWeapon.shots}, S${sgtWeapon.s} AP${sgtWeapon.ap} D${sgtWeapon.damage || 1})` });
    
    // Sergeant shots
    let sgtTotalShots = sgtWeapon.shots;
    if (sgtWeapon.type === "Rapid Fire" && halfRange) {
      sgtTotalShots *= 2;
      log.push({ phase: "Sergeant", text: `  Rapid Fire half range: ${sgtTotalShots} shots` });
    }
    
    // Sergeant To Hit (same BS as squad)
    let sgtHitNeeded = BS_TO_HIT[bs] || 6;
    let sgtSnapShooting = false;
    if (sgtWeapon.type === "Heavy" && moved) {
      sgtSnapShooting = true;
      if (bs <= 3) sgtHitNeeded = 6;
      else if (bs <= 5) sgtHitNeeded = 5;
      else if (bs <= 7) sgtHitNeeded = 4;
      else sgtHitNeeded = 3;
    }
    if (sgtWeapon.type === "Pistol" && moved) {
      // Pistols can fire normally even if moved
    }
    
    const sgtHitRolls = rollD6s(sgtTotalShots);
    rolls.hit.push(...sgtHitRolls.map(r => ({ value: r, success: r >= sgtHitNeeded, sergeant: true })));
    
    // Gets Hot for sergeant
    if (sgtWeapon.rules?.getshot) {
      const sgtOnes = sgtHitRolls.filter(r => r === 1).length;
      if (sgtOnes > 0) {
        getsHotWounds += sgtOnes;
        log.push({ phase: "Sergeant", text: `  ⚠ Gets Hot! ${sgtOnes} roll(s) of 1 → wound(s) on sergeant!` });
      }
    }
    
    sgtHits = sgtHitRolls.filter(r => r >= sgtHitNeeded).length;
    
    // Twin-linked for sgt
    if (sgtWeapon.rules?.twinLinked) {
      const sgtMisses = sgtHitRolls.filter(r => r < sgtHitNeeded);
      const sgtRerolls = rollD6s(sgtMisses.length);
      const sgtRerollHits = sgtRerolls.filter(r => r >= sgtHitNeeded).length;
      sgtHits += sgtRerollHits;
      rolls.hit.push(...sgtRerolls.map(r => ({ value: r, success: r >= sgtHitNeeded, reroll: true, sergeant: true })));
      if (sgtRerollHits > 0) log.push({ phase: "Sergeant", text: `  Twin-linked: +${sgtRerollHits} hit(s)` });
    }
    
    log.push({ phase: "Sergeant", text: `  To Hit: ${sgtHits} hit(s) from ${sgtTotalShots} shot(s) (needs ${sgtHitNeeded}+)` });
    
    if (sgtHits > 0) {
      // Sergeant To Wound
      const sgtS = sgtWeapon.s;
      let sgtWoundNeeded;
      if (sgtWeapon.rules?.fleshbane) sgtWoundNeeded = 2;
      else if (sgtWeapon.rules?.poisoned) sgtWoundNeeded = 4;
      else if (sgtWeapon.rules?.poisoned3) sgtWoundNeeded = 3;
      else if (sgtWeapon.rules?.poisoned2) sgtWoundNeeded = 2;
      else sgtWoundNeeded = getWoundRoll(sgtS, toughness);
      
      if (sgtWoundNeeded === null) {
        log.push({ phase: "Sergeant", text: `  S${sgtS} vs T${toughness}: Cannot wound!` });
      } else {
        const sgtWoundRolls = rollD6s(sgtHits);
        let sgtRendingW = 0, sgtBreachingW = 0, sgtNormalW = 0;
        
        sgtWoundRolls.forEach(r => {
          const success = r >= sgtWoundNeeded;
          if (success) {
            sgtWounds++;
            if (sgtWeapon.rules?.rending && r === 6) sgtRendingW++;
            else if ((sgtWeapon.rules?.breaching && r >= 4) || (sgtWeapon.rules?.breaching5 && r >= 5) || (sgtWeapon.rules?.breaching6 && r === 6)) sgtBreachingW++;
            else sgtNormalW++;
          }
          rolls.wound.push({ value: r, success, sergeant: true });
        });
        
        // Shred re-rolls for sgt
        if (sgtWeapon.rules?.shred) {
          const sgtMisses = sgtWoundRolls.filter(r => r < sgtWoundNeeded);
          const sgtRerolls = rollD6s(sgtMisses.length);
          sgtRerolls.forEach(r => {
            if (r >= sgtWoundNeeded) { sgtWounds++; sgtNormalW++; }
            rolls.wound.push({ value: r, success: r >= sgtWoundNeeded, reroll: true, sergeant: true });
          });
        }
        
        if (sgtRendingW > 0) log.push({ phase: "Sergeant", text: `  🗡 Rending: ${sgtRendingW} wound(s) at AP2` });
        if (sgtBreachingW > 0) log.push({ phase: "Sergeant", text: `  💥 Breaching: ${sgtBreachingW} wound(s) at AP2` });
        log.push({ phase: "Sergeant", text: `  To Wound: ${sgtWounds} wound(s) (needs ${sgtWoundNeeded}+)` });
        
        if (sgtWounds > 0) {
          // Sergeant saves — same target
          const sgtAP = sgtWeapon.ap;
          
          function sgtResolveSaves(count, effAP, label) {
            if (count === 0) return 0;
            let bestSave = null;
            let saveType = "";
            const armNeg = effAP !== "-" && effAP !== null && parseInt(effAP) <= parseInt(armourSave);
            if (!armNeg && armourSave && armourSave !== "-" && armourSave !== "0") { bestSave = parseInt(armourSave); saveType = `${armourSave}+ Armour`; }
            if (!(sgtWeapon.rules?.ignoresCover) && coverSave && coverSave !== "-" && coverSave !== "0") { const cv = parseInt(coverSave); if (bestSave === null || cv < bestSave) { bestSave = cv; saveType = `${cv}+ Cover`; } }
            if (invulnSave && invulnSave !== "-" && invulnSave !== "0") { const iv = parseInt(invulnSave); if (bestSave === null || iv < bestSave) { bestSave = iv; saveType = `${iv}+ Invulnerable`; } }
            if (bestSave === null) { log.push({ phase: "Sergeant", text: `  ${label}: ${count} wound(s) — No save!` }); return count; }
            const sRolls = rollD6s(count);
            const saved = sRolls.filter(r => r >= bestSave).length;
            rolls.save.push(...sRolls.map(r => ({ value: r, success: r >= bestSave, needed: bestSave, sergeant: true })));
            log.push({ phase: "Sergeant", text: `  ${label}: [${sRolls.join(",")}] → ${saved} saved, ${count - saved} unsaved (${saveType}, AP${effAP})` });
            return count - saved;
          }
          
          sgtNormalW = sgtWounds - sgtRendingW - sgtBreachingW;
          sgtUnsaved += sgtResolveSaves(sgtNormalW, sgtAP, "Normal");
          if (sgtRendingW > 0) sgtUnsaved += sgtResolveSaves(sgtRendingW, "2", "Rending (AP2)");
          if (sgtBreachingW > 0) sgtUnsaved += sgtResolveSaves(sgtBreachingW, "2", "Breaching (AP2)");
          
          // FNP for sgt wounds
          sgtCasualties = sgtUnsaved;
          if (fnp && fnp !== "-" && fnp !== "0") {
            const fnpN = parseInt(fnp);
            const sgtInstantDeath = sgtS >= toughness * 2;
            if (!sgtInstantDeath) {
              const sgtFnpRolls = rollD6s(sgtUnsaved);
              const sgtFnpSaved = sgtFnpRolls.filter(r => r >= fnpN).length;
              sgtCasualties = sgtUnsaved - sgtFnpSaved;
              rolls.fnpRolls.push(...sgtFnpRolls.map(r => ({ value: r, success: r >= fnpN, sergeant: true })));
              if (sgtFnpSaved > 0) log.push({ phase: "Sergeant", text: `  FNP: ${sgtFnpSaved} saved → ${sgtCasualties} casualties` });
            }
          }
          
          // Deflagrate from sergeant
          if (sgtWeapon.rules?.deflagrate && sgtCasualties > 0) {
            deflagrateHits += sgtCasualties;
            log.push({ phase: "Sergeant", text: `  🔥 Deflagrate: +${sgtCasualties} auto-hit(s)` });
          }
        }
      }
    }
    
    log.push({ phase: "Sergeant", text: `Sergeant result: ${sgtCasualties} casualt${sgtCasualties === 1 ? "y" : "ies"}` });
    
    // Accumulate into totals
    hits += sgtHits;
    wounds += sgtWounds;
    unsavedWounds += sgtUnsaved;
    casualties += sgtCasualties;
    totalShots += hasSgt ? (sgtWeapon.type === "Rapid Fire" && halfRange ? sgtWeapon.shots * 2 : sgtWeapon.shots) : 0;
  }

  // ━━ FINAL RESULT ━━
  log.push({ phase: "Result", text: `Final: ${casualties} casualt${casualties === 1 ? 'y' : 'ies'} inflicted${hasSgt ? ` (squad: ${casualties - sgtCasualties}, sergeant: ${sgtCasualties})` : ""}` });
  if (specialRules.instant || strength >= toughness * 2) {
    log.push({ phase: "Result", text: `☠ Instant Death: Each unsaved wound removes a model regardless of remaining wounds` });
  }

  // ━━ STEP 6: Leadership & Status Checks ━━
  const statusEffects = [];
  const ldRolls = [];
  const effectiveLd = leadership || 8;
  const ldMod = (specialRules.shellShock ? -1 : 0) + (hasNoxVox ? 1 : 0);
  const modLd = Math.max(effectiveLd + ldMod, 2);
  const ldModDesc = [];
  if (specialRules.shellShock) ldModDesc.push("Shell Shock -1");
  if (hasNoxVox) ldModDesc.push("Nox-Vox +1");

  // Pinning Test (from Pinning rule or Barrage)
  if ((specialRules.pinning || weaponType === "Barrage") && casualties > 0) {
    const pinRoll = rollD6s(2);
    const pinTotal = pinRoll[0] + pinRoll[1];
    const pinPassed = pinTotal <= modLd;
    ldRolls.push({ type: "Pinning", roll: pinRoll, total: pinTotal, needed: modLd, passed: pinPassed });
    log.push({ phase: "Checks", text: `📌 Pinning Test (Ld${modLd}${ldModDesc.length ? ` [${effectiveLd}${ldModDesc.join(",")}]` : ""}): rolled ${pinRoll.join("+")}=${pinTotal} → ${pinPassed ? "PASSED" : "FAILED — unit is Pinned!"}` });
    if (!pinPassed) statusEffects.push("Pinned");
  }

  // Suppressive Check (from hits, not wounds) — Cool check
  if (specialRules.suppressive && hits > 0) {
    const supRoll = rollD6s(2);
    const supTotal = supRoll[0] + supRoll[1];
    const supPassed = supTotal <= modLd;
    ldRolls.push({ type: "Suppressive", roll: supRoll, total: supTotal, needed: modLd, passed: supPassed });
    log.push({ phase: "Checks", text: `🔻 Suppressive (Ld${modLd}${hasNoxVox ? " [Nox-Vox +1]" : ""}): rolled ${supRoll.join("+")}=${supTotal} → ${supPassed ? "PASSED" : "FAILED — unit is Suppressed!"}` });
    if (!supPassed) statusEffects.push("Suppressed");
  }

  // Stun Check (from hits) — Cool check
  if (specialRules.stun && hits > 0) {
    const stunRoll = rollD6s(2);
    const stunTotal = stunRoll[0] + stunRoll[1];
    const stunPassed = stunTotal <= modLd;
    ldRolls.push({ type: "Stun", roll: stunRoll, total: stunTotal, needed: modLd, passed: stunPassed });
    log.push({ phase: "Checks", text: `⚡ Stun (Ld${modLd}${hasNoxVox ? " [Nox-Vox +1]" : ""}): rolled ${stunRoll.join("+")}=${stunTotal} → ${stunPassed ? "PASSED" : "FAILED — unit is Stunned!"}` });
    if (!stunPassed) statusEffects.push("Stunned");
  }

  // Panic Check (from wounds) — Cool check
  if (specialRules.panic && casualties > 0) {
    const panicRoll = rollD6s(2);
    const panicTotal = panicRoll[0] + panicRoll[1];
    const panicPassed = panicTotal <= modLd;
    ldRolls.push({ type: "Panic", roll: panicRoll, total: panicTotal, needed: modLd, passed: panicPassed });
    log.push({ phase: "Checks", text: `😱 Panic (Ld${modLd}${hasNoxVox ? " [Nox-Vox +1]" : ""}): rolled ${panicRoll.join("+")}=${panicTotal} → ${panicPassed ? "PASSED" : "FAILED — unit Panics and Falls Back!"}` });
    if (!panicPassed) statusEffects.push("Panicked");
  }

  // Morale / Rout Check (25%+ casualties in a single phase)
  if (targetModels > 0 && casualties > 0) {
    const casualtyPercent = casualties / targetModels;
    if (casualtyPercent >= 0.25) {
      const moraleRoll = rollD6s(2);
      const moraleTotal = moraleRoll[0] + moraleRoll[1];
      let moralePassed = moraleTotal <= modLd;
      
      // Vexilla: re-roll failed Morale checks
      if (!moralePassed && hasVexilla) {
        const reroll = rollD6s(2);
        const rerollTotal = reroll[0] + reroll[1];
        const rerollPassed = rerollTotal <= modLd;
        log.push({ phase: "Checks", text: `🏳 Morale Check (25%+ casualties: ${casualties}/${targetModels}, Ld${modLd}): rolled ${moraleRoll.join("+")}=${moraleTotal} → FAILED` });
        log.push({ phase: "Checks", text: `⚑ Vexilla: re-rolling Morale → rolled ${reroll.join("+")}=${rerollTotal} → ${rerollPassed ? "PASSED — unit holds!" : "FAILED — unit Falls Back!"}` });
        ldRolls.push({ type: "Morale", roll: moraleRoll, total: moraleTotal, needed: modLd, passed: false });
        ldRolls.push({ type: "Morale (Vexilla Re-roll)", roll: reroll, total: rerollTotal, needed: modLd, passed: rerollPassed });
        moralePassed = rerollPassed;
      } else {
        ldRolls.push({ type: "Morale", roll: moraleRoll, total: moraleTotal, needed: modLd, passed: moralePassed });
        log.push({ phase: "Checks", text: `🏳 Morale Check (25%+ casualties: ${casualties}/${targetModels}, Ld${modLd}): rolled ${moraleRoll.join("+")}=${moraleTotal} → ${moralePassed ? "PASSED — unit holds!" : "FAILED — unit Falls Back!"}` });
      }
      if (!moralePassed) statusEffects.push("Falling Back");
    }
  }

  if (statusEffects.length > 0) {
    log.push({ phase: "Checks", text: `Status: ${statusEffects.join(", ")}` });
  }

  return { log, rolls, casualties, getsHotWounds, precisionHits, totalShots, hits, wounds, unsaved: unsavedWounds, deflagrateHits, criticalHitWounds, statusEffects, ldRolls };
}

// ━━━ STATISTICAL CALCULATOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━ RETURN FIRE RESOLVER (Shooting Phase Reaction) ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Defender fires back as a reaction during the shooting phase using snap shots (6+)
function resolveReturnFire(params) {
  const {
    defenderModels, returnFireShots, returnFireS, returnFireAP,
    attackerT, attackerSv, attackerInv, attackerFnp, attackerW,
  } = params;

  const log = [];
  const rolls = { hit: [], wound: [], save: [], fnp: [] };

  log.push({ phase: "Return Fire", text: `🎯 Defender fires Return Fire reaction! (Snap Shots — hits on 6+)` });
  const totalShots = defenderModels * returnFireShots;
  log.push({ phase: "Return Fire", text: `${defenderModels} model(s) × ${returnFireShots} shot(s) = ${totalShots} total shots` });

  // Hit (snap shots = 6+)
  const hitRolls = rollD6s(totalShots);
  rolls.hit = hitRolls.map(r => ({ value: r, success: r >= 6 }));
  const hits = hitRolls.filter(r => r >= 6).length;
  log.push({ phase: "Return Fire", text: `To Hit (6+): ${hits} hit(s) from ${totalShots} shots` });

  if (hits === 0) {
    log.push({ phase: "Return Fire", text: `Return Fire inflicts no casualties.` });
    return { log, rolls, casualties: 0 };
  }

  // Wound
  const woundNeeded = getWoundRoll(returnFireS, attackerT);
  if (woundNeeded === null) {
    log.push({ phase: "Return Fire", text: `S${returnFireS} vs T${attackerT}: Cannot wound!` });
    return { log, rolls, casualties: 0 };
  }
  log.push({ phase: "Return Fire", text: `To Wound: S${returnFireS} vs T${attackerT} → needs ${woundNeeded}+` });
  const woundRolls = rollD6s(hits);
  rolls.wound = woundRolls.map(r => ({ value: r, success: r >= woundNeeded }));
  const wounds = woundRolls.filter(r => r >= woundNeeded).length;
  log.push({ phase: "Return Fire", text: `${wounds} wound(s) from ${hits} hit(s)` });

  if (wounds === 0) {
    log.push({ phase: "Return Fire", text: `Return Fire inflicts no casualties.` });
    return { log, rolls, casualties: 0 };
  }

  // Save
  const svN = attackerSv !== "-" ? parseInt(attackerSv) : null;
  const invN = attackerInv !== "-" ? parseInt(attackerInv) : null;
  const apNum = returnFireAP !== "-" ? parseInt(returnFireAP) : null;
  let bestSave = null;
  if (invN) bestSave = invN;
  if (svN && apNum && svN < apNum) {
    bestSave = bestSave ? Math.min(bestSave, svN) : svN;
  } else if (svN && !apNum) {
    bestSave = bestSave ? Math.min(bestSave, svN) : svN;
  }

  let unsaved = wounds;
  if (bestSave && bestSave <= 6) {
    const saveRolls = rollD6s(wounds);
    rolls.save = saveRolls.map(r => ({ value: r, success: r >= bestSave }));
    const saved = saveRolls.filter(r => r >= bestSave).length;
    unsaved = wounds - saved;
    log.push({ phase: "Return Fire", text: `Saves (${bestSave}+): ${saved} saved, ${unsaved} unsaved wound(s)` });
  } else {
    log.push({ phase: "Return Fire", text: `No save available — ${unsaved} unsaved wound(s)` });
  }

  if (unsaved === 0) {
    log.push({ phase: "Return Fire", text: `Return Fire inflicts no casualties.` });
    return { log, rolls, casualties: 0 };
  }

  // FNP
  const fnpN = attackerFnp !== "-" ? parseInt(attackerFnp) : null;
  if (fnpN && unsaved > 0) {
    const fnpRolls = rollD6s(unsaved);
    rolls.fnp = fnpRolls.map(r => ({ value: r, success: r >= fnpN }));
    const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
    unsaved -= fnpSaved;
    log.push({ phase: "Return Fire", text: `FNP (${fnpN}+): ${fnpSaved} saved → ${unsaved} unsaved` });
  }

  // Multi-wound
  const w = attackerW || 1;
  const casualties = w > 1 ? Math.floor(unsaved / w) : unsaved;
  if (w > 1 && unsaved > 0) {
    const remainder = unsaved % w;
    log.push({ phase: "Return Fire", text: `${unsaved} unsaved vs ${w}W models → ${casualties} model(s) slain${remainder > 0 ? `, ${remainder} wound(s) on a model` : ""}` });
  } else {
    log.push({ phase: "Return Fire", text: `☠ ${casualties} attacker model(s) slain by Return Fire!` });
  }

  return { log, rolls, casualties };
}

function calculateExpected(params) {
  const { numModels, numShots, bs, strength, ap, toughness, armourSave, invulnSave, coverSave, fnp, specialRules, halfRange, indirect, weaponType, sgtEnabled, sgtWeapon } = params;

  const hasSgt = sgtEnabled && sgtWeapon;
  const squadModels = hasSgt ? Math.max(numModels - 1, 0) : numModels;
  let totalShots = squadModels * numShots;
  if (weaponType === "Rapid Fire" && halfRange) totalShots = squadModels * numShots * 2;

  // Hit probability
  let hitNeeded = BS_TO_HIT[bs] || 6;
  if (weaponType === "Heavy" && params.moved) hitNeeded = 6;
  if (weaponType === "Barrage" && (indirect || params.moved)) hitNeeded = 6;
  let pHit = (7 - hitNeeded) / 6;
  if (specialRules.twinLinked) pHit = pHit + (1 - pHit) * pHit;

  // Wound probability
  let woundNeeded;
  if (specialRules.fleshbane) woundNeeded = 2;
  else if (specialRules.poisoned) woundNeeded = 4;
  else if (specialRules.poisoned3) woundNeeded = 3;
  else if (specialRules.poisoned2) woundNeeded = 2;
  else woundNeeded = getWoundRoll(strength, toughness);

  if (woundNeeded === null) return { expHits: totalShots * pHit, expWounds: 0, expUnsaved: 0, expCasualties: 0 };

  let pWound = (7 - woundNeeded) / 6;
  if (specialRules.shred) pWound = pWound + (1 - pWound) * pWound;

  // Save probability (simplified — uses best available save)
  function getBestSave(effectiveAP) {
    let best = null;
    const armourNegated = effectiveAP !== "-" && effectiveAP !== null && parseInt(effectiveAP) <= parseInt(armourSave);
    if (!armourNegated && armourSave && armourSave !== "-" && armourSave !== "0") best = parseInt(armourSave);
    if (!specialRules.ignoresCover && coverSave && coverSave !== "-" && coverSave !== "0") {
      const cv = parseInt(coverSave);
      if (best === null || cv < best) best = cv;
    }
    if (invulnSave && invulnSave !== "-" && invulnSave !== "0") {
      const iv = parseInt(invulnSave);
      if (best === null || iv < best) best = iv;
    }
    return best;
  }

  const normalSave = getBestSave(ap);
  const pNormalFail = normalSave ? (normalSave - 1) / 6 : 1;

  // FNP
  let pFnpFail = 1;
  const instantDeath = strength >= toughness * 2; // 3rd Ed: No "Instant Death" rule, just high damage
  if (fnp && fnp !== "-" && fnp !== "0" && !instantDeath) {
    pFnpFail = (parseInt(fnp) - 1) / 6;
  }

  const expHits = totalShots * pHit;
  const expWounds = expHits * pWound;
  const expUnsaved = expWounds * pNormalFail;
  const expCasualties = expUnsaved * pFnpFail;

  // Sergeant contribution
  let sgtExpCas = 0;
  if (hasSgt) {
    let sgtShots = sgtWeapon.shots;
    if (sgtWeapon.type === "Rapid Fire" && halfRange) sgtShots *= 2;
    
    let sgtHitNeeded = BS_TO_HIT[bs] || 6;
    if (sgtWeapon.type === "Heavy" && params.moved) {
      if (bs <= 3) sgtHitNeeded = 6;
      else if (bs <= 5) sgtHitNeeded = 5;
      else sgtHitNeeded = 4;
    }
    let sgtPHit = (7 - sgtHitNeeded) / 6;
    if (sgtWeapon.rules?.twinLinked) sgtPHit = sgtPHit + (1 - sgtPHit) * sgtPHit;
    
    let sgtWoundNeeded;
    if (sgtWeapon.rules?.fleshbane) sgtWoundNeeded = 2;
    else if (sgtWeapon.rules?.poisoned) sgtWoundNeeded = 4;
    else if (sgtWeapon.rules?.poisoned3) sgtWoundNeeded = 3;
    else sgtWoundNeeded = getWoundRoll(sgtWeapon.s, toughness);
    
    if (sgtWoundNeeded !== null) {
      let sgtPWound = (7 - sgtWoundNeeded) / 6;
      if (sgtWeapon.rules?.shred) sgtPWound = sgtPWound + (1 - sgtPWound) * sgtPWound;
      
      const sgtSave = getBestSave(sgtWeapon.ap);
      const sgtPFail = sgtSave ? (sgtSave - 1) / 6 : 1;
      
      sgtExpCas = sgtShots * sgtPHit * sgtPWound * sgtPFail * pFnpFail;
    }
  }

  const totalExpCas = expCasualties + sgtExpCas;

  return { expHits: (expHits + (hasSgt ? sgtWeapon.shots * ((7 - (BS_TO_HIT[bs] || 6)) / 6) : 0)).toFixed(1), expWounds: (expWounds + sgtExpCas / (pNormalFail * pFnpFail || 1)).toFixed(1), expUnsaved: (expUnsaved + sgtExpCas / (pFnpFail || 1)).toFixed(1), expCasualties: totalExpCas.toFixed(1) };
}

// ━━━ CHALLENGE SUB-PHASE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CHALLENGE_GAMBITS = [
  { id: "none", name: "No Gambit", desc: "No special effect", focusMod: 0, effect: null },
  { id: "seize", name: "Seize the Initiative", desc: "Roll extra Focus die, discard lowest", focusMod: 0, effect: "extraFocusDie" },
  { id: "flurry", name: "Flurry of Blows", desc: "+D3 Attacks, but Damage set to 1", focusMod: 0, effect: "flurry" },
  { id: "finishing", name: "Finishing Blow", desc: "Roll extra Focus die discard highest; +1 S & Damage", focusMod: 0, effect: "finishing" },
  { id: "feint", name: "Feint and Riposte", desc: "Deny opponent one Gambit (first picker only)", focusMod: 0, effect: "feint" },
  { id: "guard", name: "Guard Up", desc: "Reduce your attacks to 1; opponent gets -1 to hit", focusMod: 0, effect: "guard" },
  { id: "press", name: "Press the Attack", desc: "+1 to Focus Roll; +1 Attack", focusMod: 1, effect: "press" },
  { id: "measured", name: "Measured Strike", desc: "+1 AP improvement (min AP1)", focusMod: 0, effect: "measured" },
  { id: "taunt", name: "Taunt and Bait", desc: "If you lose Focus, opponent must re-roll one hit", focusMod: -1, effect: "taunt" },
];

function resolveChallenge(params) {
  const {
    // Attacker champion
    atkWS, atkS, atkAP, atkI, atkA, atkW, atkT, atkSv, atkInv, atkFnp, atkRules,
    atkGambit, atkName,
    // Defender champion
    defWS, defS, defAP, defI, defA, defW, defT, defSv, defInv, defFnp, defRules,
    defGambit, defName,
    // Context
    atkSupport, defSupport, // number of supporting models (per 5 = +2 Focus)
    isCharging,
  } = params;

  const log = [];
  const rolls = {
    attacker: { focus: [], hit: [], wound: [], save: [], fnp: [] },
    defender: { focus: [], hit: [], wound: [], save: [], fnp: [] },
  };

  const atkGambitData = CHALLENGE_GAMBITS.find(g => g.id === atkGambit) || CHALLENGE_GAMBITS[0];
  const defGambitData = CHALLENGE_GAMBITS.find(g => g.id === defGambit) || CHALLENGE_GAMBITS[0];

  log.push({ phase: "Challenge", text: `⚔ CHALLENGE DECLARED!` });
  log.push({ phase: "Challenge", text: `${atkName || "Attacker Champion"} vs ${defName || "Defender Champion"}` });
  log.push({ phase: "Gambit", text: `Attacker Gambit: ${atkGambitData.name} — ${atkGambitData.desc}` });
  log.push({ phase: "Gambit", text: `Defender Gambit: ${defGambitData.name} — ${defGambitData.desc}` });

  // ━━ STEP 1: Focus Roll ━━
  // D6 + Initiative + Gambit modifiers + Support
  function rollFocus(baseI, gambitData, support, label, rollKey) {
    let dice;
    if (gambitData.effect === "extraFocusDie") {
      // Seize: roll 2, discard lowest
      dice = rollD6s(2);
      rolls[rollKey].focus.push(...dice.map(d => ({ value: d, success: true })));
      const best = Math.max(...dice);
      log.push({ phase: "Focus", text: `${label} Seize the Initiative: rolled ${dice.join(", ")} → keeps ${best}` });
      return best + baseI + gambitData.focusMod + support;
    } else if (gambitData.effect === "finishing") {
      // Finishing Blow: roll 2, discard highest
      dice = rollD6s(2);
      rolls[rollKey].focus.push(...dice.map(d => ({ value: d, success: true })));
      const worst = Math.min(...dice);
      log.push({ phase: "Focus", text: `${label} Finishing Blow: rolled ${dice.join(", ")} → keeps ${worst} (discards highest)` });
      return worst + baseI + gambitData.focusMod + support;
    } else {
      dice = rollD6s(1);
      rolls[rollKey].focus.push({ value: dice[0], success: true });
      return dice[0] + baseI + gambitData.focusMod + support;
    }
  }

  const atkSupportBonus = Math.floor((atkSupport || 0) / 5) * 2;
  const defSupportBonus = Math.floor((defSupport || 0) / 5) * 2;

  let atkFocus = rollFocus(atkI, atkGambitData, atkSupportBonus, "Attacker", "attacker");
  let defFocus = rollFocus(defI, defGambitData, defSupportBonus, "Defender", "defender");

  // Duelist's Edge
  if (atkRules?.m_duelist) { atkFocus += 1; log.push({ phase: "Focus", text: `Attacker: Duelist's Edge +1 Focus` }); }
  if (defRules?.m_duelist) { defFocus += 1; log.push({ phase: "Focus", text: `Defender: Duelist's Edge +1 Focus` }); }

  log.push({ phase: "Focus", text: `Focus Totals: Attacker ${atkFocus} vs Defender ${defFocus}` });

  // Tie-breaker
  while (atkFocus === defFocus) {
    const a = rollD6(); const d = rollD6();
    log.push({ phase: "Focus", text: `Tied! Re-roll: Attacker ${a} vs Defender ${d}` });
    atkFocus = a; defFocus = d;
  }

  const atkWinsFocus = atkFocus > defFocus;
  const focusWinner = atkWinsFocus ? "Attacker" : "Defender";
  log.push({ phase: "Focus", text: `🏆 ${focusWinner} wins Focus! Strikes first & gains +1 Attack.` });

  // ━━ STEP 2: Apply Gambit Effects to stats ━━
  let effAtkA = atkA, effAtkS = atkS, effAtkAP = atkAP;
  let effDefA = defA, effDefS = defS, effDefAP = defAP;
  let atkHitPenalty = 0, defHitPenalty = 0;
  let atkDamageCap = null, defDamageCap = null;
  let tauntAtk = false, tauntDef = false;

  // Focus winner gets +1A
  if (atkWinsFocus) effAtkA += 1; else effDefA += 1;

  // Attacker gambit
  if (atkGambitData.effect === "flurry") {
    const bonus = Math.ceil(Math.random() * 3);
    effAtkA += bonus; atkDamageCap = 1;
    log.push({ phase: "Gambit", text: `Attacker Flurry: +${bonus} Attacks (Damage capped to 1)` });
  }
  if (atkGambitData.effect === "finishing") {
    effAtkS += 1;
    log.push({ phase: "Gambit", text: `Attacker Finishing Blow: +1 Strength (now S${effAtkS}), +1 Damage` });
  }
  if (atkGambitData.effect === "guard") {
    effAtkA = 1; defHitPenalty += 1;
    log.push({ phase: "Gambit", text: `Attacker Guard Up: 1 attack only; Defender -1 to hit` });
  }
  if (atkGambitData.effect === "press") {
    effAtkA += 1;
    log.push({ phase: "Gambit", text: `Attacker Press the Attack: +1 Attack` });
  }
  if (atkGambitData.effect === "measured") {
    const curAP = effAtkAP === "-" ? 7 : parseInt(effAtkAP);
    effAtkAP = String(Math.max(curAP - 1, 1));
    log.push({ phase: "Gambit", text: `Attacker Measured Strike: AP improved to ${effAtkAP}` });
  }
  if (atkGambitData.effect === "taunt") { tauntAtk = true; }

  // Defender gambit
  if (defGambitData.effect === "flurry") {
    const bonus = Math.ceil(Math.random() * 3);
    effDefA += bonus; defDamageCap = 1;
    log.push({ phase: "Gambit", text: `Defender Flurry: +${bonus} Attacks (Damage capped to 1)` });
  }
  if (defGambitData.effect === "finishing") {
    effDefS += 1;
    log.push({ phase: "Gambit", text: `Defender Finishing Blow: +1 Strength (now S${effDefS}), +1 Damage` });
  }
  if (defGambitData.effect === "guard") {
    effDefA = 1; atkHitPenalty += 1;
    log.push({ phase: "Gambit", text: `Defender Guard Up: 1 attack only; Attacker -1 to hit` });
  }
  if (defGambitData.effect === "press") {
    effDefA += 1;
    log.push({ phase: "Gambit", text: `Defender Press the Attack: +1 Attack` });
  }
  if (defGambitData.effect === "measured") {
    const curAP = effDefAP === "-" ? 7 : parseInt(effDefAP);
    effDefAP = String(Math.max(curAP - 1, 1));
    log.push({ phase: "Gambit", text: `Defender Measured Strike: AP improved to ${effDefAP}` });
  }
  if (defGambitData.effect === "taunt") { tauntDef = true; }

  // ━━ STEP 3: Resolve strikes in Focus order ━━
  function resolveStrike(label, numA, aWS, dWS, aS, dT, aAP, dSv, dInv, dFnp, dW, rules, hitPen, damageCap, tauntOpp, rollKey) {
    const strikeLog = [];
    const toHitBase = getMeleeToHit(aWS, dWS);
    const toHit = Math.min(Math.max(toHitBase + hitPen, 2), 6);
    strikeLog.push(`${label}: ${numA} attack(s), needs ${toHit}+ (WS${aWS} vs WS${dWS}${hitPen ? `, ${hitPen > 0 ? "+" : ""}${hitPen} penalty` : ""})`);

    const hitRolls = rollD6s(numA);
    rolls[rollKey].hit.push(...hitRolls.map(r => ({ value: r, success: r >= toHit })));
    let hits = hitRolls.filter(r => r >= toHit).length;

    // Taunt: opponent must re-roll one successful hit
    if (tauntOpp && hits > 0) {
      const reroll = rollD6();
      if (reroll < toHit) { hits -= 1; strikeLog.push(`Taunt & Bait: forced re-roll → ${reroll} (miss!) — ${hits} hit(s)`); }
      else { strikeLog.push(`Taunt & Bait: forced re-roll → ${reroll} (still hits)`); }
    }

    strikeLog.push(`To Hit: ${hits} hit(s) from ${numA} attack(s)`);
    if (hits === 0) { strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 }; }

    // Wound
    const toWoundNeeded = getWoundRoll(aS, dT);
    if (toWoundNeeded === null) {
      strikeLog.push(`S${aS} vs T${dT}: Cannot wound!`);
      strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 };
    }

    const woundRolls = rollD6s(hits);
    let wounds = 0, rendingW = 0, murderousW = 0, normalW = 0;
    woundRolls.forEach(r => {
      if (r >= toWoundNeeded) {
        wounds++;
        if (rules?.m_rending && r === 6) rendingW++;
        else if (rules?.m_murderous && r === 6) murderousW++;
        else normalW++;
      }
      rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded });
    });

    // Shred
    if (rules?.m_shred) {
      const misses = woundRolls.filter(r => r < toWoundNeeded);
      const rerolls = rollD6s(misses.length);
      rerolls.forEach(r => {
        if (r >= toWoundNeeded) { wounds++; if (rules?.m_rending && r === 6) rendingW++; else normalW++; }
        rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded, reroll: true });
      });
      strikeLog.push(`Shred: re-rolled ${misses.length} → ${rerolls.filter(r => r >= toWoundNeeded).length} extra`);
    }

    normalW = wounds - rendingW - murderousW;
    if (rendingW > 0) strikeLog.push(`🗡 Rending: ${rendingW} at AP2`);
    if (murderousW > 0) strikeLog.push(`💀 Murderous Strike: ${murderousW} — Instant Death`);
    strikeLog.push(`Wounds: ${wounds} from ${hits} hit(s)`);
    if (wounds === 0) { strikeLog.forEach(t => log.push({ phase: "Strike", text: t })); return { wounds: 0 }; }

    // Saves
    let unsaved = 0;
    function doSave(count, effAP, saveLabel) {
      if (count === 0) return 0;
      let best = null;
      const armNeg = effAP !== "-" && parseInt(effAP) <= parseInt(dSv);
      if (!armNeg && dSv && dSv !== "-" && dSv !== "0") best = parseInt(dSv);
      if (dInv && dInv !== "-" && dInv !== "0") { const iv = parseInt(dInv); if (best === null || iv < best) best = iv; }
      if (best === null) return count;
      const saveRolls = rollD6s(count);
      rolls[rollKey].save.push(...saveRolls.map(r => ({ value: r, success: r >= best })));
      const saved = saveRolls.filter(r => r >= best).length;
      strikeLog.push(`${saveLabel} (${best}+, AP${effAP}): ${saved} saved, ${count - saved} unsaved`);
      return count - saved;
    }

    unsaved += doSave(normalW, aAP, "Normal saves");
    if (rendingW > 0) unsaved += doSave(rendingW, "2", "Rending saves");
    if (murderousW > 0) unsaved += doSave(murderousW, aAP, "Murderous saves");

    // FNP
    let totalWounds = unsaved;
    if (dFnp && dFnp !== "-" && dFnp !== "0" && unsaved > 0) {
      const fnpN = parseInt(dFnp);
      const instantDeath = aS >= dT * 2 || murderousW > 0;
      if (!instantDeath) {
        const fnpRolls = rollD6s(unsaved);
        const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
        totalWounds = unsaved - fnpSaved;
        rolls[rollKey].fnp.push(...fnpRolls.map(r => ({ value: r, success: r >= fnpN })));
        strikeLog.push(`FNP (${fnpN}+): ${fnpSaved} saved → ${totalWounds} unsaved`);
      } else { strikeLog.push(`Instant Death — FNP cannot be used!`); }
    }

    // Damage cap from Flurry
    if (damageCap) {
      strikeLog.push(`Flurry: Damage capped to ${damageCap} per wound`);
    }

    strikeLog.forEach(t => log.push({ phase: "Strike", text: t }));
    return { wounds: totalWounds };
  }

  let atkWoundsRemaining = atkW;
  let defWoundsRemaining = defW;
  let atkWoundsDealt = 0, defWoundsDealt = 0;

  if (atkWinsFocus) {
    // Attacker strikes first
    const atkResult = resolveStrike(`⚔ ${atkName || "Attacker"} (Focus winner)`, effAtkA, atkWS, defWS, effAtkS, defT, effAtkAP, defSv, defInv, defFnp, defW, atkRules, 0, atkDamageCap, tauntDef, "attacker");
    defWoundsRemaining -= atkResult.wounds;
    atkWoundsDealt = atkResult.wounds;

    if (defWoundsRemaining > 0) {
      const defResult = resolveStrike(`🛡 ${defName || "Defender"} strikes back`, effDefA, defWS, atkWS, effDefS, atkT, effDefAP, atkSv, atkInv, atkFnp, atkW, defRules, 0, defDamageCap, tauntAtk, "defender");
      atkWoundsRemaining -= defResult.wounds;
      defWoundsDealt = defResult.wounds;
    } else {
      log.push({ phase: "Strike", text: `💀 ${defName || "Defender"} is SLAIN! No strike back.` });
    }
  } else {
    // Defender strikes first
    const defResult = resolveStrike(`🛡 ${defName || "Defender"} (Focus winner)`, effDefA, defWS, atkWS, effDefS, atkT, effDefAP, atkSv, atkInv, atkFnp, atkW, defRules, 0, defDamageCap, tauntAtk, "defender");
    atkWoundsRemaining -= defResult.wounds;
    defWoundsDealt = defResult.wounds;

    if (atkWoundsRemaining > 0) {
      const atkResult = resolveStrike(`⚔ ${atkName || "Attacker"} strikes back`, effAtkA, atkWS, defWS, effAtkS, defT, effAtkAP, defSv, defInv, defFnp, defW, atkRules, 0, atkDamageCap, tauntDef, "attacker");
      defWoundsRemaining -= atkResult.wounds;
      atkWoundsDealt = atkResult.wounds;
    } else {
      log.push({ phase: "Strike", text: `💀 ${atkName || "Attacker"} is SLAIN! No strike back.` });
    }
  }

  // ━━ STEP 4: Challenge Result ━━
  const atkSlain = atkWoundsRemaining <= 0;
  const defSlain = defWoundsRemaining <= 0;

  let result;
  if (atkSlain && defSlain) {
    result = { winner: "Mutual Kill", glory: 0 };
    log.push({ phase: "Result", text: `💀 Both champions fall! Mutual destruction.` });
  } else if (defSlain) {
    const glory = atkWoundsDealt;
    result = { winner: "Attacker", glory, slain: defName || "Defender" };
    log.push({ phase: "Result", text: `⚔ ${atkName || "Attacker"} SLAYS ${defName || "Defender"}! (+${glory} to Combat Resolution)` });
  } else if (atkSlain) {
    const glory = defWoundsDealt;
    result = { winner: "Defender", glory, slain: atkName || "Attacker" };
    log.push({ phase: "Result", text: `🛡 ${defName || "Defender"} SLAYS ${atkName || "Attacker"}! (+${glory} to Combat Resolution)` });
  } else {
    const diff = atkWoundsDealt - defWoundsDealt;
    result = { winner: diff > 0 ? "Attacker" : diff < 0 ? "Defender" : "Draw", glory: Math.abs(diff) };
    log.push({ phase: "Result", text: `Challenge ongoing — ${atkName || "Attacker"}: ${Math.max(atkWoundsRemaining, 0)}W remaining, ${defName || "Defender"}: ${Math.max(defWoundsRemaining, 0)}W remaining` });
    log.push({ phase: "Result", text: `Round result: ${diff > 0 ? "Attacker" : diff < 0 ? "Defender" : "Draw"} by ${Math.abs(diff)} wound(s)` });
  }

  return {
    log, rolls, result, focusWinner,
    atkWoundsDealt, defWoundsDealt,
    atkWoundsRemaining: Math.max(atkWoundsRemaining, 0),
    defWoundsRemaining: Math.max(defWoundsRemaining, 0),
    atkSlain, defSlain, atkGambitData, defGambitData,
  };
}

// ━━━ ASSAULT PHASE RESOLVER (Standalone melee combat) ━━━━━━━━━━━━━━━━━━━━━━━━
function resolveAssaultPhase(params) {
  const {
    // Attacker
    attackerModels, attackerWS, attackerS, attackerAP, attackerI, attackerA, attackerW,
    attackerSv, attackerInv, attackerFnp, attackerT,
    attackerRules,
    // Defender
    defenderModels, defenderWS, defenderS, defenderAP, defenderI, defenderA, defenderW,
    defenderSv, defenderInv, defenderFnp, defenderT,
    defenderRules,
    // Charge
    isCharging, disordered,
  } = params;

  const log = [];
  const rolls = {
    attacker: { hit: [], wound: [], save: [], fnp: [] },
    defender: { hit: [], wound: [], save: [], fnp: [] },
  };

  // ━━ STEP 1: Calculate Attacks ━━
  let atkAttacks = attackerA;
  if (isCharging && !disordered) {
    atkAttacks += 1;
    log.push({ phase: "Setup", text: `Attacker gets +1 Attack for charging (${attackerA} + 1 = ${atkAttacks})` });
  } else if (isCharging && disordered) {
    log.push({ phase: "Setup", text: `Disordered Charge: no +1 Attack bonus (${atkAttacks} attacks)` });
  }

  // Rampage
  if (attackerRules?.m_rampage && defenderModels > attackerModels) {
    const rampageBonus = Math.ceil(Math.random() * 3);
    atkAttacks += rampageBonus;
    log.push({ phase: "Setup", text: `Rampage: Outnumbered! +${rampageBonus} attacks (now ${atkAttacks})` });
  }

  const totalAtkAttacks = attackerModels * atkAttacks;
  const totalDefAttacks = defenderModels * defenderA;

  // ━━ STEP 2: Initiative Order ━━
  const atkEffI = attackerRules?.m_unwieldy ? 1 : attackerI;
  const defEffI = defenderRules?.m_unwieldy ? 1 : defenderI;
  const attackerFirst = isCharging ? atkEffI >= defEffI : atkEffI > defEffI;

  log.push({ phase: "Melee", text: `Initiative: Attacker I${atkEffI} vs Defender I${defEffI} → ${attackerFirst ? "Attacker strikes first" : "Defender strikes first"}` });
  log.push({ phase: "Melee", text: `Attacker: ${attackerModels} model(s) × ${atkAttacks} attack(s) = ${totalAtkAttacks}` });
  log.push({ phase: "Melee", text: `Defender: ${defenderModels} model(s) × ${defenderA} attack(s) = ${totalDefAttacks}` });

  // ━━ Helper: resolve one side's attacks ━━
  function resolveSide(label, numAttacks, aWS, dWS, aS, dT, aAP, dSv, dInv, dFnp, dW, rules, rollKey) {
    if (numAttacks <= 0) return { casualties: 0, unsavedWounds: 0 };
    const sideLog = [];
    const toHitNeeded = getMeleeToHit(aWS, dWS);
    sideLog.push(`${label}: ${numAttacks} attacks, needs ${toHitNeeded}+ to hit (WS${aWS} vs WS${dWS})`);

    // Hit
    const hitRolls = rollD6s(numAttacks);
    rolls[rollKey].hit.push(...hitRolls.map(r => ({ value: r, success: r >= toHitNeeded })));
    let hits = hitRolls.filter(r => r >= toHitNeeded).length;
    sideLog.push(`To Hit: ${hits} hit(s) from ${numAttacks} attacks`);
    if (hits === 0) { sideLog.forEach(t => log.push({ phase: "Melee", text: t })); return { casualties: 0, unsavedWounds: 0 }; }

    // Wound
    const toWoundNeeded = getWoundRoll(aS, dT);
    if (toWoundNeeded === null) {
      sideLog.push(`S${aS} vs T${dT}: Cannot wound!`);
      sideLog.forEach(t => log.push({ phase: "Melee", text: t }));
      return { casualties: 0, unsavedWounds: 0 };
    }
    sideLog.push(`To Wound: S${aS} vs T${dT} → needs ${toWoundNeeded}+`);

    const woundRolls = rollD6s(hits);
    let wounds = 0, rendingW = 0, normalW = 0, murderousW = 0;
    woundRolls.forEach(r => {
      const success = r >= toWoundNeeded;
      if (success) {
        wounds++;
        if (rules?.m_rending && r === 6) rendingW++;
        else if (rules?.m_murderous && r === 6) murderousW++;
        else normalW++;
      }
      rolls[rollKey].wound.push({ value: r, success });
    });

    // Shred re-rolls
    if (rules?.m_shred) {
      const misses = woundRolls.filter(r => r < toWoundNeeded);
      const rerolls = rollD6s(misses.length);
      rerolls.forEach(r => {
        if (r >= toWoundNeeded) {
          wounds++;
          if (rules?.m_rending && r === 6) rendingW++;
          else normalW++;
        }
        rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded, reroll: true });
      });
      sideLog.push(`Shred: re-rolled ${misses.length} → ${rerolls.filter(r => r >= toWoundNeeded).length} extra wound(s)`);
    }

    if (rendingW > 0) sideLog.push(`🗡 Rending: ${rendingW} wound(s) at AP2`);
    if (murderousW > 0) sideLog.push(`💀 Murderous Strike: ${murderousW} wound(s) cause Instant Death`);
    normalW = wounds - rendingW - murderousW;
    sideLog.push(`Wounds: ${wounds} wound(s) from ${hits} hit(s)`);
    if (wounds === 0) { sideLog.forEach(t => log.push({ phase: "Melee", text: t })); return { casualties: 0, unsavedWounds: 0 }; }

    // Saves
    let unsaved = 0;
    function doSaves(count, effAP, saveLabel) {
      if (count === 0) return 0;
      let best = null;
      const armNeg = effAP !== "-" && parseInt(effAP) <= parseInt(dSv);
      if (!armNeg && dSv && dSv !== "-" && dSv !== "0") best = parseInt(dSv);
      if (dInv && dInv !== "-" && dInv !== "0") {
        const iv = parseInt(dInv);
        if (best === null || iv < best) best = iv;
      }
      if (best === null) return count;
      const saveRolls = rollD6s(count);
      rolls[rollKey].save.push(...saveRolls.map(r => ({ value: r, success: r >= best })));
      const saved = saveRolls.filter(r => r >= best).length;
      sideLog.push(`${saveLabel} saves (${best}+, AP${effAP}): ${saved} saved, ${count - saved} unsaved`);
      return count - saved;
    }

    unsaved += doSaves(normalW, aAP, "Normal");
    if (rendingW > 0) unsaved += doSaves(rendingW, "2", "Rending (AP2)");
    if (murderousW > 0) unsaved += doSaves(murderousW, aAP, "Murderous Strike");

    // FNP
    let casualties = unsaved;
    if (dFnp && dFnp !== "-" && dFnp !== "0" && unsaved > 0) {
      const fnpN = parseInt(dFnp);
      const instantDeath = aS >= dT * 2 || murderousW > 0;
      if (!instantDeath) {
        const fnpRolls = rollD6s(unsaved);
        const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
        casualties = unsaved - fnpSaved;
        rolls[rollKey].fnp.push(...fnpRolls.map(r => ({ value: r, success: r >= fnpN })));
        sideLog.push(`FNP (${fnpN}+): ${fnpSaved} saved → ${casualties} unsaved`);
      } else {
        sideLog.push(`Instant Death — FNP cannot be used!`);
      }
    }

    // Multi-wound
    const modelCas = dW > 1 ? Math.floor(casualties / dW) : casualties;
    if (dW > 1 && casualties > 0) {
      const rem = casualties % dW;
      sideLog.push(`${casualties} unsaved vs ${dW}W models → ${modelCas} model(s) slain${rem > 0 ? `, ${rem} wound(s) remaining` : ""}`);
    }

    sideLog.forEach(t => log.push({ phase: "Melee", text: t }));
    return { casualties: modelCas, unsavedWounds: casualties };
  }

  // ━━ STEP 3: Resolve in Initiative Order ━━
  let atkCasualties = 0, defCasualties = 0;
  let remainAtk = attackerModels, remainDef = defenderModels;

  if (attackerFirst) {
    const atkRes = resolveSide(`⚔ Attacker (I${atkEffI})`, totalAtkAttacks, attackerWS, defenderWS, attackerS, defenderT, attackerAP, defenderSv, defenderInv, defenderFnp, defenderW, attackerRules, "attacker");
    defCasualties = atkRes.casualties;
    remainDef = Math.max(defenderModels - defCasualties, 0);

    if (remainDef > 0) {
      const defTotal = remainDef * defenderA;
      const defRes = resolveSide(`🛡 Defender strikes back (I${defEffI}, ${remainDef} remaining)`, defTotal, defenderWS, attackerWS, defenderS, attackerT, defenderAP, attackerSv, attackerInv, attackerFnp, attackerW, defenderRules, "defender");
      atkCasualties = defRes.casualties;
      remainAtk = Math.max(attackerModels - atkCasualties, 0);
    }
  } else {
    const defRes = resolveSide(`🛡 Defender (I${defEffI}) strikes first`, totalDefAttacks, defenderWS, attackerWS, defenderS, attackerT, defenderAP, attackerSv, attackerInv, attackerFnp, attackerW, defenderRules, "defender");
    atkCasualties = defRes.casualties;
    remainAtk = Math.max(attackerModels - atkCasualties, 0);

    if (remainAtk > 0) {
      const atkTotal = remainAtk * atkAttacks;
      const atkRes = resolveSide(`⚔ Attacker strikes back (I${atkEffI}, ${remainAtk} remaining)`, atkTotal, attackerWS, defenderWS, attackerS, defenderT, attackerAP, defenderSv, defenderInv, defenderFnp, defenderW, attackerRules, "attacker");
      defCasualties = atkRes.casualties;
      remainDef = Math.max(defenderModels - defCasualties, 0);
    }
  }

  // ━━ STEP 4: Combat Resolution ━━
  const atkWoundsInflicted = defCasualties;
  const defWoundsInflicted = atkCasualties;
  const diff = atkWoundsInflicted - defWoundsInflicted;

  let combatResult;
  if (diff > 0) {
    combatResult = { winner: "Attacker", diff };
    log.push({ phase: "Combat Res", text: `⚔ Attacker wins by ${diff} (${atkWoundsInflicted} vs ${defWoundsInflicted})` });
    log.push({ phase: "Combat Res", text: `Defender must take Morale check at Ld -${diff}` });
  } else if (diff < 0) {
    combatResult = { winner: "Defender", diff: Math.abs(diff) };
    log.push({ phase: "Combat Res", text: `🛡 Defender wins by ${Math.abs(diff)} (${defWoundsInflicted} vs ${atkWoundsInflicted})` });
    log.push({ phase: "Combat Res", text: `Attacker must take Morale check at Ld -${Math.abs(diff)}` });
  } else {
    combatResult = { winner: "Draw", diff: 0 };
    log.push({ phase: "Combat Res", text: `⚖ Draw! (${atkWoundsInflicted} vs ${defWoundsInflicted}) — combat continues.` });
  }

  log.push({ phase: "Combat Res", text: `Survivors: ${remainAtk} attacker(s), ${remainDef} defender(s)` });

  return {
    log, rolls, combatResult,
    attackerCasualties: atkCasualties, defenderCasualties: defCasualties,
    remainingAttackers: remainAtk, remainingDefenders: remainDef,
    isCharging,
  };
}

// ━━━ CHARGE PHASE RESOLVER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// WS comparison chart for melee To Hit
const WS_TO_HIT_CHART = {
  higher: 3,    // Attacker WS > Defender WS
  equal: 4,     // Attacker WS == Defender WS
  lower: 5,     // Attacker WS < Defender WS (but not half or less)
  halfOrLess: 5 // Attacker WS <= Defender WS / 2 (still 5+ in HH)
};

function getMeleeToHit(attackerWS, defenderWS) {
  if (attackerWS > defenderWS) return 3;
  if (attackerWS === defenderWS) return 4;
  return 5;
}

const MELEE_SPECIAL_RULES = [
  { id: "m_shred", label: "Shred", desc: "Re-roll failed To Wound rolls in melee" },
  { id: "m_rending", label: "Rending", desc: "To Wound of 6 is AP2 in melee" },
  { id: "m_murderous", label: "Murderous Strike", desc: "To Wound of 6 causes Instant Death" },
  { id: "m_unwieldy", label: "Unwieldy", desc: "Always strikes at Initiative 1" },
  { id: "m_specialist", label: "Specialist Weapon", desc: "+1A if paired with another Specialist Weapon" },
  { id: "m_brutal", label: "Brutal (X)", desc: "+1 to wound roll" },
  { id: "m_reaping", label: "Reaping Blow", desc: "Each model makes 1 extra attack against all models in base contact" },
  { id: "m_duelist", label: "Duelist's Edge", desc: "+1 Initiative in challenges" },
  { id: "m_rampage", label: "Rampage", desc: "+D3 attacks when outnumbered" },
];

// Melee weapons keyed by unit id
// ws/i/a/w/t/sv/inv/fnp are the MODEL's base stats that get auto-filled
// s/ap/rules are the WEAPON stats
const MELEE_WEAPON_PROFILES = {
  // LEGIONES ASTARTES
  tactical: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Bayonet (Bolt)", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  tactical_support: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  heavy_support: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  breacher: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Boarding Shield + Blade", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "6", fnp: "-", rules: {} },
  ],
  assault: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Lightning Claw", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true, m_specialist: true } },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
  ],
  seeker: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  recon: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "4", inv: "-", fnp: "-", rules: {} },
    { name: "Combat Blade", ws: 4, s: 4, ap: "6", i: 4, a: 1, w: 1, t: 4, sv: "4", inv: "-", fnp: "-", rules: {} },
  ],
  destroyer: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: {} },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: {} },
  ],
  // ELITES
  veteran: [
    { name: "Chain Bayonet", ws: 5, s: 4, ap: "5", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Chainsword", ws: 5, s: 4, ap: "-", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Lightning Claw", ws: 5, s: 4, ap: "3", i: 4, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: { m_shred: true, m_specialist: true } },
    { name: "Power Axe", ws: 5, s: 5, ap: "2", i: 3, a: 2, w: 1, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  praetor_pa: [
    { name: "Paragon Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true, m_specialist: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Thunder Hammer", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Chainfist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Power Weapon", ws: 6, s: 4, ap: "3", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Lightning Claw (pair)", ws: 6, s: 4, ap: "3", i: 5, a: 5, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_specialist: true } },
    { name: "Power Axe", ws: 6, s: 5, ap: "2", i: 4, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
  ],
  praetor_ta: [
    { name: "Paragon Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true, m_specialist: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Chainfist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Lightning Claw (pair)", ws: 6, s: 4, ap: "3", i: 5, a: 5, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_specialist: true } },
    { name: "Thunder Hammer", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Power Weapon", ws: 6, s: 4, ap: "3", i: 5, a: 4, w: 3, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
  ],
  praetor_sat: [
    { name: "Saturnine Concussion Hammer", ws: 6, s: 10, ap: "2", i: 1, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Saturnine War Axe", ws: 6, s: 7, ap: "2", i: 4, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_specialist: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Chainfist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Thunder Hammer", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Paragon Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 4, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true, m_specialist: true } },
  ],
  champion: [
    { name: "Paragon Blade", ws: 6, s: 5, ap: "2", i: 5, a: 4, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true, m_specialist: true, m_duelist: true } },
    { name: "Power Weapon", ws: 6, s: 4, ap: "3", i: 5, a: 4, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_duelist: true } },
    { name: "Power Fist", ws: 6, s: 8, ap: "2", i: 1, a: 4, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true, m_duelist: true } },
  ],
  master_signals: [
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
  ],
  vigilator: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
    { name: "Power Dagger", ws: 5, s: 4, ap: "3", i: 5, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
  ],
  forge_lord: [
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Power Axe", ws: 4, s: 5, ap: "2", i: 3, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
    { name: "Servo-Arm", ws: 4, s: 8, ap: "1", i: 1, a: 1, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_unwieldy: true } },
  ],
  chaplain: [
    { name: "Crozius Arcanum", ws: 5, s: 6, ap: "3", i: 5, a: 3, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
  ],
  librarian: [
    { name: "Force Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Force Axe", ws: 4, s: 5, ap: "2", i: 3, a: 2, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Force Staff", ws: 4, s: 5, ap: "4", i: 4, a: 3, w: 2, t: 4, sv: "2", inv: "4", fnp: "-", rules: {} },
  ],
  herald: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
  ],
  moritat: [
    { name: "Chain Glaive", ws: 5, s: 5, ap: "3", i: 4, a: 4, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_rending: true } },
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 4, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
  ],
  siege_breaker: [
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
  ],
  centurion: [
    { name: "Power Weapon", ws: 5, s: 4, ap: "3", i: 4, a: 3, w: 3, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
    { name: "Power Fist", ws: 5, s: 8, ap: "2", i: 1, a: 3, w: 3, t: 4, sv: "2", inv: "-", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Power Axe", ws: 5, s: 5, ap: "2", i: 3, a: 3, w: 3, t: 4, sv: "2", inv: "-", fnp: "-", rules: {} },
  ],
  apothecary: [
    { name: "Chain Bayonet", ws: 4, s: 4, ap: "5", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: {} },
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 1, t: 4, sv: "3", inv: "-", fnp: "5", rules: {} },
  ],
  // TERMINATORS
  cataphractii: [
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Chainfist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Lightning Claw (pair)", ws: 4, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_specialist: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
  ],
  tartaros: [
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Chainfist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Lightning Claw (pair)", ws: 4, s: 4, ap: "3", i: 4, a: 3, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_shred: true, m_specialist: true } },
    { name: "Power Weapon", ws: 4, s: 4, ap: "3", i: 4, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: {} },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 2, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
  ],
  saturnine: [
    { name: "Saturnine Concussion Hammer", ws: 4, s: 10, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Saturnine War Axe", ws: 4, s: 7, ap: "2", i: 4, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_specialist: true } },
    { name: "Power Fist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Chainfist", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
    { name: "Thunder Hammer", ws: 4, s: 8, ap: "2", i: 1, a: 2, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: { m_unwieldy: true, m_specialist: true } },
  ],
  // VEHICLES & DREADS
  contemptor: [
    { name: "Dreadnought Close Combat Weapon", ws: 5, s: 7, ap: "2", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", rules: {} },
    { name: "Chainfist", ws: 5, s: 7, ap: "2", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", rules: {} },
    { name: "Graviton Ram", ws: 5, s: 8, ap: "1", i: 4, a: 4, w: 7, t: 7, sv: "2", inv: "5", fnp: "-", rules: {} },
  ],
  saturnine_dread: [
    { name: "Dreadnought Power Fist", ws: 5, s: 8, ap: "2", i: 4, a: 4, w: 9, t: 8, sv: "2", inv: "5", fnp: "-", rules: {} },
  ],
  leviathan: [
    { name: "Leviathan Siege Drill", ws: 5, s: 10, ap: "1", i: 4, a: 4, w: 8, t: 8, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Leviathan Siege Claw", ws: 5, s: 8, ap: "2", i: 4, a: 4, w: 8, t: 8, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
  ],
  // SOLAR AUXILIA
  lasrifle: [
    { name: "Close Combat Weapon", ws: 2, s: 3, ap: "-", i: 3, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: {} },
  ],
  veletaris: [
    { name: "Power Axe", ws: 3, s: 4, ap: "2", i: 2, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: {} },
    { name: "Close Combat Weapon", ws: 3, s: 3, ap: "-", i: 3, a: 1, w: 1, t: 3, sv: "4", inv: "-", fnp: "-", rules: {} },
  ],
  ogryn: [
    { name: "Ogryn Charonite Claws", ws: 4, s: 6, ap: "3", i: 3, a: 3, w: 3, t: 5, sv: "4", inv: "-", fnp: "5", rules: { m_shred: true } },
  ],
  // MECHANICUM
  thallax: [
    { name: "Lightning Claws", ws: 3, s: 5, ap: "5", i: 3, a: 2, w: 2, t: 5, sv: "4", inv: "-", fnp: "5", rules: { m_rending: true } },
  ],
  castellax: [
    { name: "Shock Chargers (pair)", ws: 4, s: 6, ap: "3", i: 3, a: 3, w: 4, t: 7, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Siege Wrecker", ws: 4, s: 8, ap: "2", i: 3, a: 2, w: 4, t: 7, sv: "3", inv: "-", fnp: "-", rules: {} },
    { name: "Power Blade Array", ws: 4, s: 6, ap: "3", i: 3, a: 4, w: 4, t: 7, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true } },
  ],
  thanatar: [
    { name: "Thanatar Fists", ws: 3, s: 8, ap: "2", i: 2, a: 2, w: 6, t: 8, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  tech_thrall: [
    { name: "Close Combat Weapon", ws: 2, s: 3, ap: "-", i: 3, a: 1, w: 1, t: 3, sv: "5", inv: "-", fnp: "6", rules: {} },
  ],
  myrmidon_dest: [
    { name: "Power Weapon", ws: 4, s: 5, ap: "3", i: 3, a: 2, w: 3, t: 5, sv: "2", inv: "-", fnp: "5", rules: {} },
  ],
  vorax: [
    { name: "Vorax Power Blades", ws: 4, s: 5, ap: "3", i: 4, a: 4, w: 4, t: 6, sv: "3", inv: "-", fnp: "-", rules: { m_rending: true } },
  ],
  // CUSTODES
  custodian_guard: [
    { name: "Guardian Spear", ws: 5, s: 6, ap: "2", i: 5, a: 3, w: 3, t: 5, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Sentinel Blade + Shield", ws: 5, s: 5, ap: "3", i: 5, a: 3, w: 3, t: 5, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  sagittarum: [
    { name: "Guardian Spear", ws: 5, s: 6, ap: "2", i: 5, a: 3, w: 3, t: 5, sv: "2", inv: "5", fnp: "-", rules: {} },
  ],
  aquilon: [
    { name: "Solerite Power Gauntlet", ws: 5, s: 10, ap: "1", i: 5, a: 4, w: 4, t: 6, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Solerite Power Talon", ws: 5, s: 6, ap: "2", i: 5, a: 5, w: 4, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
  ],
  // PRIMARCHS (LOYALIST)
  lion: [
    { name: "Lion Sword", ws: 9, s: 7, ap: "2", i: 7, a: 6, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Wolf Blade", ws: 9, s: 6, ap: "2", i: 7, a: 6, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_rending: true } },
  ],
  khan: [
    { name: "White Tiger Dao", ws: 8, s: 7, ap: "2", i: 7, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  russ: [
    { name: "Sword of Balenight", ws: 8, s: 7, ap: "2", i: 6, a: 7, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "The Axe of Helwinter", ws: 8, s: 8, ap: "2", i: 5, a: 7, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
  ],
  dorn: [
    { name: "Storm's Teeth (Chainsword)", ws: 8, s: 8, ap: "2", i: 5, a: 6, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
    { name: "Auric Fist (Power Fist)", ws: 8, s: 10, ap: "1", i: 1, a: 6, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true } },
  ],
  sanguinius: [
    { name: "The Blade Encarmine", ws: 9, s: 7, ap: "2", i: 7, a: 7, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "The Spear of Telesto", ws: 9, s: 8, ap: "1", i: 6, a: 6, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Moonsilver Blade", ws: 9, s: 6, ap: "2", i: 7, a: 7, w: 8, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  ferrus: [
    { name: "Forgebreaker", ws: 7, s: 10, ap: "1", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
    { name: "Medusan Fists", ws: 7, s: 8, ap: "2", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  guilliman: [
    { name: "The Gladius Incandor", ws: 7, s: 6, ap: "2", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Hand of Dominion (Fist)", ws: 7, s: 10, ap: "1", i: 1, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_unwieldy: true } },
  ],
  vulkan: [
    { name: "Dawnbringer", ws: 7, s: 10, ap: "1", i: 5, a: 5, w: 9, t: 7, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
  ],
  corax: [
    { name: "Raven's Talons (pair)", ws: 8, s: 6, ap: "2", i: 7, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_rending: true } },
    { name: "Sable's Edge", ws: 8, s: 7, ap: "2", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  // PRIMARCHS (TRAITOR)
  fulgrim: [
    { name: "Fireblade (Sword)", ws: 9, s: 6, ap: "2", i: 8, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Laer Blade", ws: 9, s: 7, ap: "2", i: 8, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_rending: true } },
  ],
  perturabo: [
    { name: "Forgebreaker", ws: 7, s: 10, ap: "1", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
    { name: "Logos (Melee)", ws: 7, s: 8, ap: "2", i: 5, a: 5, w: 8, t: 7, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  curze: [
    { name: "Mercy & Forgiveness (Claws)", ws: 8, s: 6, ap: "2", i: 7, a: 7, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true, m_rending: true } },
  ],
  angron: [
    { name: "Gorefather & Gorechild", ws: 9, s: 8, ap: "2", i: 6, a: 8, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
    { name: "Spite Furnace (Fists)", ws: 9, s: 7, ap: "2", i: 6, a: 8, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: {} },
  ],
  lorgar: [
    { name: "Illuminarum (Crozius)", ws: 7, s: 7, ap: "2", i: 6, a: 5, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: {} },
    { name: "Illuminarum (Force)", ws: 7, s: 7, ap: "2", i: 6, a: 5, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  mortarion: [
    { name: "Silence (Scythe)", ws: 7, s: 8, ap: "2", i: 5, a: 5, w: 9, t: 7, sv: "2", inv: "4", fnp: "5", rules: { m_murderous: true } },
    { name: "The Lantern (Melee)", ws: 7, s: 7, ap: "2", i: 5, a: 5, w: 9, t: 7, sv: "2", inv: "4", fnp: "5", rules: {} },
  ],
  magnus: [
    { name: "Akhenteru (Force Staff)", ws: 7, s: 8, ap: "1", i: 6, a: 5, w: 7, t: 6, sv: "2", inv: "3", fnp: "-", rules: { m_murderous: true } },
    { name: "Psychic Blades", ws: 7, s: 6, ap: "2", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "3", fnp: "-", rules: {} },
  ],
  horus: [
    { name: "Worldbreaker (Mace)", ws: 8, s: 10, ap: "1", i: 6, a: 6, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
    { name: "Talon of Horus (Claw)", ws: 8, s: 7, ap: "2", i: 7, a: 7, w: 8, t: 7, sv: "2", inv: "4", fnp: "-", rules: { m_shred: true } },
  ],
  alpharius: [
    { name: "The Pale Spear", ws: 7, s: 7, ap: "1", i: 6, a: 6, w: 7, t: 6, sv: "2", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  daemon_lesser: [
    { name: "Warp Claws", ws: 3, s: 4, ap: "-", i: 4, a: 2, w: 1, t: 4, sv: "-", inv: "5", fnp: "-", rules: {} },
  ],
  daemon_greater: [
    { name: "Daemon Weapon", ws: 6, s: 7, ap: "2", i: 6, a: 5, w: 6, t: 6, sv: "-", inv: "4", fnp: "-", rules: { m_murderous: true } },
  ],
  // FAST ATTACK
  scimitar_jetbike: [
    { name: "Chainsword", ws: 4, s: 4, ap: "-", i: 4, a: 1, w: 2, t: 4, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  javelin: [
    { name: "Close Combat Attack", ws: 4, s: 4, ap: "-", i: 4, a: 2, w: 4, t: 6, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
  land_speeder: [
    { name: "Close Combat Attack", ws: 4, s: 4, ap: "-", i: 4, a: 2, w: 3, t: 5, sv: "3", inv: "-", fnp: "-", rules: {} },
  ],
};

function resolveChargePhase(params) {
  const {
    chargeDistance, // distance to target in inches
    chargingModels, // number of models in charging unit
    chargerWS, chargerS, chargerAP, chargerI, chargerA, chargerW,
    defenderWS, defenderT, defenderSv, defenderInv, defenderFnp,
    defenderModels, defenderS, defenderAP, defenderA, defenderI, defenderW,
    chargerRules, defenderRules,
    terrain, // difficult terrain
    counterCharge, // defender has Counter-Attack
    disordered, // disordered charge (multiple targets or terrain)
    overwatchBS, // defender's BS for overwatch
    overwatchShots, overwatchS, overwatchAP, overwatchRules,
    doOverwatch, // whether defender fires overwatch
    chargerSv, chargerInv, chargerFnp, // charger's saves for overwatch resolution
    chargerT, // charger's T for overwatch
    // Volley Fire
    doVolleyFire, volleyFireShots, volleyFireS, volleyFireAP,
    defenderW_target, // defender wounds per model (for volley fire casualty calc)
  } = params;

  const log = [];
  const rolls = { charge: [], volley: { hit: [], wound: [], save: [] }, overwatch: { hit: [], wound: [], save: [] }, melee: { hit: [], wound: [], save: [], fnp: [] }, defender: { hit: [], wound: [], save: [], fnp: [] } };
  
  // ━━ STEP 1: Declare Charge ━━
  log.push({ phase: "Charge", text: `Declaring charge against target ${chargeDistance}" away` });
  if (terrain) log.push({ phase: "Charge", text: `⚠ Charging through Difficult Terrain — subtract 2" from charge roll` });
  if (disordered) log.push({ phase: "Charge", text: `⚠ Disordered Charge — charging unit loses +1A bonus` });

  // ━━ STEP 1b: Volley Fire (Charger fires Assault weapons at snap shot) ━━
  let volleyCasualties = 0;
  let remainingDefendersAfterVolley = defenderModels;
  if (doVolleyFire && volleyFireShots > 0 && chargingModels > 0) {
    log.push({ phase: "Volley Fire", text: `🔫 Charger fires Volley Fire! (Assault weapons — Snap Shots, hits on 6+)` });
    const vfTotalShots = chargingModels * volleyFireShots;
    log.push({ phase: "Volley Fire", text: `${chargingModels} model(s) × ${volleyFireShots} shot(s) = ${vfTotalShots} total shots` });

    const vfHitRolls = rollD6s(vfTotalShots);
    rolls.volley.hit = vfHitRolls.map(r => ({ value: r, success: r >= 6 }));
    const vfHits = vfHitRolls.filter(r => r >= 6).length;
    log.push({ phase: "Volley Fire", text: `To Hit (6+): ${vfHits} hit(s) from ${vfTotalShots} shots` });

    if (vfHits > 0) {
      const vfWoundNeeded = getWoundRoll(volleyFireS, defenderT);
      if (vfWoundNeeded !== null) {
        log.push({ phase: "Volley Fire", text: `To Wound: S${volleyFireS} vs T${defenderT} → needs ${vfWoundNeeded}+` });
        const vfWoundRolls = rollD6s(vfHits);
        rolls.volley.wound = vfWoundRolls.map(r => ({ value: r, success: r >= vfWoundNeeded }));
        const vfWounds = vfWoundRolls.filter(r => r >= vfWoundNeeded).length;
        log.push({ phase: "Volley Fire", text: `${vfWounds} wound(s) from ${vfHits} hit(s)` });

        if (vfWounds > 0) {
          // Save
          const svN = defenderSv !== "-" ? parseInt(defenderSv) : null;
          const invN = defenderInv !== "-" ? parseInt(defenderInv) : null;
          const apNum = volleyFireAP !== "-" ? parseInt(volleyFireAP) : null;
          let vfBestSave = null;
          if (invN) vfBestSave = invN;
          if (svN && apNum && svN < apNum) {
            vfBestSave = vfBestSave ? Math.min(vfBestSave, svN) : svN;
          } else if (svN && !apNum) {
            vfBestSave = vfBestSave ? Math.min(vfBestSave, svN) : svN;
          }

          if (vfBestSave && vfBestSave <= 6) {
            const vfSaveRolls = rollD6s(vfWounds);
            rolls.volley.save = vfSaveRolls.map(r => ({ value: r, success: r >= vfBestSave }));
            const vfSaved = vfSaveRolls.filter(r => r >= vfBestSave).length;
            let vfUnsaved = vfWounds - vfSaved;

            // FNP
            const vfFnpN = defenderFnp !== "-" ? parseInt(defenderFnp) : null;
            if (vfFnpN && vfUnsaved > 0) {
              const fnpRolls = rollD6s(vfUnsaved);
              const fnpSaved = fnpRolls.filter(r => r >= vfFnpN).length;
              vfUnsaved -= fnpSaved;
              log.push({ phase: "Volley Fire", text: `Saves (${vfBestSave}+): ${vfSaved} saved, FNP (${vfFnpN}+): ${fnpSaved} saved → ${vfUnsaved} unsaved` });
            } else {
              log.push({ phase: "Volley Fire", text: `Saves (${vfBestSave}+): ${vfSaved} saved, ${vfUnsaved} unsaved wound(s)` });
            }

            const defW = defenderW_target || defenderW || 1;
            volleyCasualties = defW > 1 ? Math.floor(vfUnsaved / defW) : vfUnsaved;
            if (defW > 1 && vfUnsaved > 0) {
              const remainder = vfUnsaved % defW;
              log.push({ phase: "Volley Fire", text: `${vfUnsaved} unsaved vs ${defW}W models → ${volleyCasualties} model(s) slain${remainder > 0 ? `, ${remainder} wound(s) on a model` : ""}` });
            }
          } else {
            volleyCasualties = vfWounds;
            const defW = defenderW_target || defenderW || 1;
            volleyCasualties = defW > 1 ? Math.floor(vfWounds / defW) : vfWounds;
            log.push({ phase: "Volley Fire", text: `No save available — ${volleyCasualties} model(s) slain` });
          }
        }
      } else {
        log.push({ phase: "Volley Fire", text: `S${volleyFireS} vs T${defenderT}: Cannot wound!` });
      }
    }

    if (volleyCasualties > 0) {
      log.push({ phase: "Volley Fire", text: `🔫 ${volleyCasualties} model(s) slain by Volley Fire!` });
      remainingDefendersAfterVolley = Math.max(defenderModels - volleyCasualties, 0);
    } else {
      log.push({ phase: "Volley Fire", text: `Volley Fire inflicts no casualties.` });
    }
  }

  // ━━ STEP 2: Overwatch ━━
  let overwatchCasualties = 0;
  if (doOverwatch && overwatchShots > 0 && remainingDefendersAfterVolley > 0) {
    log.push({ phase: "Overwatch", text: `🔥 Defender fires Overwatch! (Snap Shots — BS1 equivalent, hits on 6+)` });
    const owTotalShots = remainingDefendersAfterVolley * overwatchShots;
    log.push({ phase: "Overwatch", text: `${remainingDefendersAfterVolley} model(s) × ${overwatchShots} shot(s) = ${owTotalShots} total shots` });
    
    const owHitRolls = rollD6s(owTotalShots);
    rolls.overwatch.hit = owHitRolls.map(r => ({ value: r, success: r >= 6 }));
    const owHits = owHitRolls.filter(r => r >= 6).length;
    log.push({ phase: "Overwatch", text: `To Hit (6+): ${owHits} hit(s) from ${owTotalShots} shots` });
    
    if (owHits > 0) {
      // Wound
      const owWoundNeeded = getWoundRoll(overwatchS, chargerT);
      if (owWoundNeeded !== null) {
        log.push({ phase: "Overwatch", text: `To Wound: S${overwatchS} vs T${chargerT} → needs ${owWoundNeeded}+` });
        const owWoundRolls = rollD6s(owHits);
        rolls.overwatch.wound = owWoundRolls.map(r => ({ value: r, success: r >= owWoundNeeded }));
        const owWounds = owWoundRolls.filter(r => r >= owWoundNeeded).length;
        log.push({ phase: "Overwatch", text: `${owWounds} wound(s) from ${owHits} hit(s)` });
        
        if (owWounds > 0) {
          // Saves
          let owBestSave = null;
          const owArmNeg = overwatchAP !== "-" && overwatchAP !== null && parseInt(overwatchAP) <= parseInt(chargerSv);
          if (!owArmNeg && chargerSv && chargerSv !== "-" && chargerSv !== "0") owBestSave = parseInt(chargerSv);
          if (chargerInv && chargerInv !== "-" && chargerInv !== "0") {
            const iv = parseInt(chargerInv);
            if (owBestSave === null || iv < owBestSave) owBestSave = iv;
          }
          
          if (owBestSave) {
            const owSaveRolls = rollD6s(owWounds);
            rolls.overwatch.save = owSaveRolls.map(r => ({ value: r, success: r >= owBestSave }));
            const owSaved = owSaveRolls.filter(r => r >= owBestSave).length;
            overwatchCasualties = owWounds - owSaved;
            log.push({ phase: "Overwatch", text: `Saves (${owBestSave}+): ${owSaved} saved, ${overwatchCasualties} unsaved wound(s)` });
          } else {
            overwatchCasualties = owWounds;
            log.push({ phase: "Overwatch", text: `No save available — ${overwatchCasualties} unsaved wound(s)` });
          }
          
          // FNP for charger
          if (chargerFnp && chargerFnp !== "-" && chargerFnp !== "0" && overwatchCasualties > 0) {
            const fnpN = parseInt(chargerFnp);
            const fnpRolls = rollD6s(overwatchCasualties);
            const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
            overwatchCasualties -= fnpSaved;
            log.push({ phase: "Overwatch", text: `FNP (${fnpN}+): ${fnpSaved} saved → ${overwatchCasualties} casualties from Overwatch` });
          }
        }
      } else {
        log.push({ phase: "Overwatch", text: `S${overwatchS} vs T${chargerT}: Cannot wound!` });
      }
    }
    
    if (overwatchCasualties > 0) {
      log.push({ phase: "Overwatch", text: `☠ ${overwatchCasualties} model(s) slain by Overwatch fire!` });
    } else {
      log.push({ phase: "Overwatch", text: `Overwatch inflicts no casualties.` });
    }
  }

  const survivingChargers = Math.max(chargingModels - overwatchCasualties, 0);
  if (survivingChargers === 0) {
    log.push({ phase: "Charge", text: `All charging models slain by Overwatch! Charge fails.` });
    return { log, rolls, chargeSucceeded: false, chargeRoll: 0, overwatchCasualties, volleyCasualties, survivingChargers: 0, meleeAttackerCasualties: 0, meleeDefenderCasualties: 0, combatResult: null };
  }

  // ━━ STEP 3: Roll Charge Distance ━━
  const chargeDice = rollD6s(2);
  let chargeRoll = chargeDice[0] + chargeDice[1];
  rolls.charge = chargeDice;
  
  let effectiveCharge = chargeRoll;
  if (terrain) effectiveCharge = Math.max(chargeRoll - 2, 0);
  
  log.push({ phase: "Charge", text: `Charge roll: ${chargeDice[0]} + ${chargeDice[1]} = ${chargeRoll}"${terrain ? ` - 2" (terrain) = ${effectiveCharge}"` : ""}` });
  
  const chargeSucceeded = effectiveCharge >= chargeDistance;
  
  if (!chargeSucceeded) {
    log.push({ phase: "Charge", text: `❌ Charge FAILED! Needed ${chargeDistance}", rolled ${effectiveCharge}". Unit moves ${effectiveCharge}" toward target.` });
    return { log, rolls, chargeSucceeded: false, chargeRoll: effectiveCharge, overwatchCasualties, volleyCasualties, survivingChargers, meleeAttackerCasualties: 0, meleeDefenderCasualties: 0, combatResult: null };
  }
  
  log.push({ phase: "Charge", text: `✅ Charge SUCCEEDED! ${effectiveCharge}" ≥ ${chargeDistance}" needed.` });

  // ━━ STEP 4: Fight Sub-Phase (Initiative order) ━━
  const chargerEffI = chargerRules?.m_unwieldy ? 1 : chargerI;
  const defenderEffI = defenderRules?.m_unwieldy ? 1 : defenderI;
  
  // Determine attack order
  const chargerFirst = chargerEffI >= defenderEffI; // Charger wins ties (charged)
  
  // Calculate attacks
  let chargerAttacks = chargerA;
  if (!disordered) {
    chargerAttacks += 1; // +1A for charging
    log.push({ phase: "Melee", text: `Charger gets +1 Attack for charging (${chargerA} + 1 = ${chargerAttacks})` });
  } else {
    log.push({ phase: "Melee", text: `Disordered Charge: no +1 Attack bonus (${chargerAttacks} attacks)` });
  }
  
  // Rampage
  if (chargerRules?.m_rampage && defenderModels > survivingChargers) {
    const rampageBonus = rollD6s(1)[0] <= 3 ? rollD6s(1)[0] : Math.ceil(Math.random() * 3);
    chargerAttacks += rampageBonus;
    log.push({ phase: "Melee", text: `Rampage: Outnumbered! +${rampageBonus} attacks (now ${chargerAttacks})` });
  }

  const totalChargerAttacks = survivingChargers * chargerAttacks;
  const totalDefenderAttacks = remainingDefendersAfterVolley * defenderA;
  
  log.push({ phase: "Melee", text: `Initiative order: Charger I${chargerEffI} vs Defender I${defenderEffI} → ${chargerFirst ? "Charger strikes first" : "Defender strikes first"}` });

  // Helper function for melee resolution
  function resolveMeleeRound(attackerLabel, numAttacks, attackerWS, defenderWS, attackerS, defenderT, attackerAP, defenderSv, defenderInv, defenderFnp, defenderWounds, rules, rollKey) {
    if (numAttacks <= 0) return { casualties: 0, unsavedWounds: 0 };
    
    const meleeLog = [];
    const toHitNeeded = getMeleeToHit(attackerWS, defenderWS);
    meleeLog.push(`${attackerLabel}: ${numAttacks} attacks, needs ${toHitNeeded}+ to hit (WS${attackerWS} vs WS${defenderWS})`);
    
    // To Hit
    const hitRolls = rollD6s(numAttacks);
    rolls[rollKey].hit.push(...hitRolls.map(r => ({ value: r, success: r >= toHitNeeded })));
    let hits = hitRolls.filter(r => r >= toHitNeeded).length;
    meleeLog.push(`To Hit: ${hits} hit(s) from ${numAttacks} attacks`);
    
    if (hits === 0) {
      meleeLog.forEach(t => log.push({ phase: "Melee", text: t }));
      return { casualties: 0, unsavedWounds: 0 };
    }
    
    // To Wound
    const toWoundNeeded = getWoundRoll(attackerS, defenderT);
    if (toWoundNeeded === null) {
      meleeLog.push(`S${attackerS} vs T${defenderT}: Cannot wound!`);
      meleeLog.forEach(t => log.push({ phase: "Melee", text: t }));
      return { casualties: 0, unsavedWounds: 0 };
    }
    
    meleeLog.push(`To Wound: S${attackerS} vs T${defenderT} → needs ${toWoundNeeded}+`);
    
    const woundRolls = rollD6s(hits);
    let wounds = 0;
    let rendingW = 0, normalW = 0, murderousW = 0;
    
    woundRolls.forEach(r => {
      const success = r >= toWoundNeeded;
      if (success) {
        wounds++;
        if (rules?.m_rending && r === 6) rendingW++;
        else if (rules?.m_murderous && r === 6) murderousW++;
        else normalW++;
      }
      rolls[rollKey].wound.push({ value: r, success });
    });
    
    // Shred re-rolls
    if (rules?.m_shred) {
      const misses = woundRolls.filter(r => r < toWoundNeeded);
      const rerolls = rollD6s(misses.length);
      rerolls.forEach(r => {
        if (r >= toWoundNeeded) {
          wounds++;
          if (rules?.m_rending && r === 6) rendingW++;
          else normalW++;
        }
        rolls[rollKey].wound.push({ value: r, success: r >= toWoundNeeded, reroll: true });
      });
      meleeLog.push(`Shred: re-rolled ${misses.length} → ${rerolls.filter(r => r >= toWoundNeeded).length} extra wound(s)`);
    }
    
    if (rendingW > 0) meleeLog.push(`🗡 Rending: ${rendingW} wound(s) at AP2`);
    if (murderousW > 0) meleeLog.push(`💀 Murderous Strike: ${murderousW} wound(s) cause Instant Death`);
    normalW = wounds - rendingW - murderousW;
    meleeLog.push(`Wounds: ${wounds} wound(s) from ${hits} hit(s)`);
    
    if (wounds === 0) {
      meleeLog.forEach(t => log.push({ phase: "Melee", text: t }));
      return { casualties: 0, unsavedWounds: 0 };
    }
    
    // Saves
    let unsaved = 0;
    function doSaves(count, effAP, label) {
      if (count === 0) return 0;
      let best = null;
      const armNeg = effAP !== "-" && parseInt(effAP) <= parseInt(defenderSv);
      if (!armNeg && defenderSv && defenderSv !== "-" && defenderSv !== "0") best = parseInt(defenderSv);
      if (defenderInv && defenderInv !== "-" && defenderInv !== "0") {
        const iv = parseInt(defenderInv);
        if (best === null || iv < best) best = iv;
      }
      if (best === null) return count;
      const saveRolls = rollD6s(count);
      rolls[rollKey].save.push(...saveRolls.map(r => ({ value: r, success: r >= best })));
      const saved = saveRolls.filter(r => r >= best).length;
      meleeLog.push(`${label} saves (${best}+, AP${effAP}): ${saved} saved, ${count - saved} unsaved`);
      return count - saved;
    }
    
    unsaved += doSaves(normalW, attackerAP, "Normal");
    if (rendingW > 0) unsaved += doSaves(rendingW, "2", "Rending (AP2)");
    if (murderousW > 0) unsaved += doSaves(murderousW, attackerAP, "Murderous Strike");
    
    // FNP
    let casualties = unsaved;
    if (defenderFnp && defenderFnp !== "-" && defenderFnp !== "0" && unsaved > 0) {
      const fnpN = parseInt(defenderFnp);
      const instantDeath = attackerS >= defenderT * 2 || murderousW > 0;
      if (!instantDeath) {
        const fnpRolls = rollD6s(unsaved);
        const fnpSaved = fnpRolls.filter(r => r >= fnpN).length;
        casualties = unsaved - fnpSaved;
        rolls[rollKey].fnp.push(...fnpRolls.map(r => ({ value: r, success: r >= fnpN })));
        meleeLog.push(`FNP (${fnpN}+): ${fnpSaved} saved → ${casualties} unsaved`);
      } else {
        meleeLog.push(`Instant Death — FNP cannot be used!`);
      }
    }
    
    // Convert unsaved wounds to model casualties based on wound count
    const modelCasualties = defenderWounds > 1 ? Math.floor(casualties / defenderWounds) : casualties;
    if (defenderWounds > 1 && casualties > 0) {
      const remainder = casualties % defenderWounds;
      meleeLog.push(`${casualties} unsaved wound(s) vs ${defenderWounds}W models → ${modelCasualties} model(s) slain${remainder > 0 ? `, ${remainder} wound(s) remaining on a model` : ""}`);
    }
    
    meleeLog.forEach(t => log.push({ phase: "Melee", text: t }));
    return { casualties: modelCasualties, unsavedWounds: casualties };
  }

  // Resolve in Initiative order
  let meleeDefenderCasualties = 0;
  let meleeAttackerCasualties = 0;
  let remainingDefenders = remainingDefendersAfterVolley;
  let remainingChargers = survivingChargers;

  if (chargerFirst) {
    // Charger strikes first
    const chargerResult = resolveMeleeRound(
      `⚔ Charger (I${chargerEffI})`, totalChargerAttacks,
      chargerWS, defenderWS, chargerS, defenderT, chargerAP,
      defenderSv, defenderInv, defenderFnp, defenderW,
      chargerRules, "melee"
    );
    meleeDefenderCasualties = chargerResult.casualties;
    remainingDefenders = Math.max(defenderModels - meleeDefenderCasualties, 0);
    
    // Defender strikes back (with remaining models)
    if (remainingDefenders > 0) {
      const defTotalAttacks = remainingDefenders * defenderA;
      const defenderResult = resolveMeleeRound(
        `🛡 Defender strikes back (I${defenderEffI}, ${remainingDefenders} remaining)`, defTotalAttacks,
        defenderWS, chargerWS, defenderS, chargerT, defenderAP,
        chargerSv, chargerInv, chargerFnp, chargerW,
        defenderRules, "defender"
      );
      meleeAttackerCasualties = defenderResult.casualties;
      remainingChargers = Math.max(survivingChargers - meleeAttackerCasualties, 0);
    }
  } else {
    // Defender strikes first
    const defenderResult = resolveMeleeRound(
      `🛡 Defender (I${defenderEffI}) strikes first`, totalDefenderAttacks,
      defenderWS, chargerWS, defenderS, chargerT, defenderAP,
      chargerSv, chargerInv, chargerFnp, chargerW,
      defenderRules, "defender"
    );
    meleeAttackerCasualties = defenderResult.casualties;
    remainingChargers = Math.max(survivingChargers - meleeAttackerCasualties, 0);
    
    // Charger strikes back
    if (remainingChargers > 0) {
      const chTotalAttacks = remainingChargers * chargerAttacks;
      const chargerResult = resolveMeleeRound(
        `⚔ Charger strikes back (I${chargerEffI}, ${remainingChargers} remaining)`, chTotalAttacks,
        chargerWS, defenderWS, chargerS, defenderT, chargerAP,
        defenderSv, defenderInv, defenderFnp, defenderW,
        chargerRules, "melee"
      );
      meleeDefenderCasualties = chargerResult.casualties;
      remainingDefenders = Math.max(defenderModels - meleeDefenderCasualties, 0);
    }
  }

  // ━━ STEP 5: Combat Resolution ━━
  const chargerWoundsInflicted = meleeDefenderCasualties;
  const defenderWoundsInflicted = meleeAttackerCasualties + overwatchCasualties;
  const combatDiff = chargerWoundsInflicted - defenderWoundsInflicted;
  
  let combatResult;
  if (combatDiff > 0) {
    combatResult = { winner: "Charger", diff: combatDiff };
    log.push({ phase: "Combat Res", text: `⚔ Combat Result: Charger wins by ${combatDiff} (${chargerWoundsInflicted} vs ${defenderWoundsInflicted})` });
    log.push({ phase: "Combat Res", text: `Defender must take Morale check at Ld -${combatDiff}` });
  } else if (combatDiff < 0) {
    combatResult = { winner: "Defender", diff: Math.abs(combatDiff) };
    log.push({ phase: "Combat Res", text: `🛡 Combat Result: Defender wins by ${Math.abs(combatDiff)} (${defenderWoundsInflicted} vs ${chargerWoundsInflicted})` });
    log.push({ phase: "Combat Res", text: `Charger must take Morale check at Ld -${Math.abs(combatDiff)}` });
  } else {
    combatResult = { winner: "Draw", diff: 0 };
    log.push({ phase: "Combat Res", text: `⚖ Combat Result: Draw! (${chargerWoundsInflicted} vs ${defenderWoundsInflicted})` });
    log.push({ phase: "Combat Res", text: `Combat continues — models remain locked in combat.` });
  }

  log.push({ phase: "Combat Res", text: `Survivors: ${remainingChargers} charger(s), ${remainingDefenders} defender(s)` });

  return { 
    log, rolls, chargeSucceeded: true, chargeRoll: effectiveCharge, 
    overwatchCasualties, volleyCasualties, survivingChargers, 
    meleeAttackerCasualties, meleeDefenderCasualties,
    combatResult, remainingChargers, remainingDefenders
  };
}

// ━━━ UNIT ICON SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getUnitIconType(name) {
  const n = name.toLowerCase();
  if (n.includes("primarch") || n.includes("lion el") || n.includes("jaghatai") || n.includes("leman russ") || n.includes("rogal dorn") || n.includes("sanguinius") || n.includes("ferrus") || n.includes("guilliman") || n.includes("vulkan") || n.includes("corax") || n.includes("fulgrim") || n.includes("perturabo") || n.includes("curze") || n.includes("angron") || n.includes("lorgar") || n.includes("mortarion") || n.includes("magnus") || n.includes("horus") || n.includes("alpharius")) return "primarch";
  if (n.includes("daemon")) return "daemon";
  if (n.includes("saturnine") && n.includes("dread")) return "dreadnought";
  // HQ characters - must check before terminator matching
  if (n.includes("praetor") || n.includes("centurion") || n.includes("magos") || n.includes("commander") || n.includes("champion") || n.includes("chaplain") || n.includes("librarian") || n.includes("moritat") || n.includes("herald") || n.includes("vigilator") || n.includes("forge lord") || n.includes("siege breaker") || n.includes("master of signal") || n.includes("apothecary")) return "commander";
  if (n.includes("cataphractii") || n.includes("tartaros") || n.includes("fulmentarus") || n.includes("aquilon") || n.includes("saturnine") || n.includes("terminator")) return "terminator";
  if (n.includes("contemptor") || n.includes("leviathan") || n.includes("deredeo") || n.includes("castra ferrum")) return "dreadnought";
  if (n.includes("predator") || n.includes("sicaran") || n.includes("land raider") || n.includes("spartan") || n.includes("proteus") || n.includes("leman russ") || n.includes("malcador") || n.includes("vindicator") || n.includes("araknae")) return "tank";
  if (n.includes("whirlwind") || n.includes("basilisk") || n.includes("medusa") || n.includes("rapier") || n.includes("thanatar")) return "artillery";
  if (n.includes("caladius") || n.includes("pallas")) return "grav_tank";
  if (n.includes("agamatus") || n.includes("jetbike") || n.includes("scimitar")) return "jetbike";
  if (n.includes("xiphon") || n.includes("storm eagle") || n.includes("fire raptor")) return "flyer";
  if (n.includes("javelin") || n.includes("land speeder")) return "grav_tank";
  if (n.includes("telemon")) return "heavy_dread";
  if (n.includes("castellax") || n.includes("vorax") || n.includes("thallax") || n.includes("krios") || n.includes("scyllax") || n.includes("automata")) return "automata";
  if (n.includes("myrmidon") || n.includes("ursarax")) return "tech_elite";
  if (n.includes("tech-thrall") || n.includes("adsecularis")) return "thrall";
  if (n.includes("custodian") || n.includes("sagittarum") || n.includes("sentinel guard") || n.includes("tribune")) return "custodes";
  if (n.includes("ogryn") || n.includes("charonite")) return "ogryn";
  if (n.includes("destroyer")) return "destroyer";
  if (n.includes("recon")) return "recon";
  if (n.includes("seeker")) return "seeker";
  if (n.includes("breacher")) return "breacher";
  if (n.includes("assault") || n.includes("despoiler")) return "assault";
  return "infantry";
}

function UnitIcon({ type, size = 36, color = "#8b6508" }) {
  const s = size;
  const icons = {
    infantry: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="22" y="13" width="10" height="3" rx="1" fill={color} opacity="0.6" transform="rotate(-15 27 14)"/>
        <rect x="7" y="14" width="7" height="5" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    terminator: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="4.5" fill={color} opacity="0.9"/>
        <path d="M10 11 H26 L28 14 V26 L24 28 H12 L8 26 V14 Z" fill={color} opacity="0.8"/>
        <rect x="10" y="28" width="6" height="7" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="28" width="6" height="7" rx="2" fill={color} opacity="0.7"/>
        <rect x="4" y="12" width="6" height="8" rx="2" fill={color} opacity="0.6"/>
        <rect x="26" y="12" width="6" height="8" rx="2" fill={color} opacity="0.6"/>
        <rect x="28" y="11" width="8" height="3" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    dreadnought: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="12" y="2" width="12" height="8" rx="2" fill={color} opacity="0.9"/>
        <rect x="8" y="10" width="20" height="16" rx="3" fill={color} opacity="0.85"/>
        <circle cx="18" cy="17" r="4" fill={color} opacity="0.5"/>
        <rect x="3" y="11" width="5" height="14" rx="2" fill={color} opacity="0.7"/>
        <rect x="28" y="11" width="5" height="14" rx="2" fill={color} opacity="0.7"/>
        <rect x="0" y="12" width="5" height="3" rx="1" fill={color} opacity="0.55"/>
        <rect x="10" y="26" width="6" height="8" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="26" width="6" height="8" rx="2" fill={color} opacity="0.7"/>
      </svg>
    ),
    heavy_dread: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="11" y="1" width="14" height="9" rx="2" fill={color} opacity="0.9"/>
        <rect x="6" y="10" width="24" height="17" rx="3" fill={color} opacity="0.85"/>
        <circle cx="18" cy="17" r="5" fill={color} opacity="0.5"/>
        <rect x="1" y="10" width="5" height="16" rx="2" fill={color} opacity="0.7"/>
        <rect x="30" y="10" width="5" height="16" rx="2" fill={color} opacity="0.7"/>
        <rect x="8" y="27" width="8" height="8" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="27" width="8" height="8" rx="2" fill={color} opacity="0.7"/>
      </svg>
    ),
    tank: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="4" y="16" width="28" height="12" rx="3" fill={color} opacity="0.85"/>
        <rect x="10" y="8" width="16" height="10" rx="2" fill={color} opacity="0.8"/>
        <rect x="22" y="4" width="14" height="4" rx="1" fill={color} opacity="0.65"/>
        <ellipse cx="8" cy="30" rx="4" ry="3" fill={color} opacity="0.6"/>
        <ellipse cx="18" cy="30" rx="4" ry="3" fill={color} opacity="0.6"/>
        <ellipse cx="28" cy="30" rx="4" ry="3" fill={color} opacity="0.6"/>
        <rect x="4" y="28" width="28" height="4" rx="2" fill={color} opacity="0.5"/>
      </svg>
    ),
    artillery: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="6" y="14" width="24" height="10" rx="3" fill={color} opacity="0.8"/>
        <rect x="14" y="6" width="12" height="10" rx="2" fill={color} opacity="0.75"/>
        <rect x="20" y="1" width="16" height="5" rx="1.5" fill={color} opacity="0.6" transform="rotate(10 28 3)"/>
        <ellipse cx="10" cy="28" rx="5" ry="4" fill={color} opacity="0.6"/>
        <ellipse cx="26" cy="28" rx="5" ry="4" fill={color} opacity="0.6"/>
        <rect x="6" y="24" width="24" height="5" rx="2" fill={color} opacity="0.5"/>
      </svg>
    ),
    grav_tank: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="22" rx="16" ry="7" fill={color} opacity="0.75"/>
        <rect x="10" y="10" width="16" height="12" rx="4" fill={color} opacity="0.85"/>
        <rect x="22" y="6" width="12" height="4" rx="1" fill={color} opacity="0.6"/>
        <ellipse cx="18" cy="32" rx="12" ry="2" fill={color} opacity="0.3"/>
      </svg>
    ),
    jetbike: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="8" r="3.5" fill={color} opacity="0.9"/>
        <path d="M12 12 H24 L28 18 L24 22 H12 L4 18 Z" fill={color} opacity="0.75"/>
        <ellipse cx="18" cy="28" rx="14" ry="4" fill={color} opacity="0.5"/>
        <rect x="6" y="22" width="24" height="6" rx="3" fill={color} opacity="0.65"/>
        <rect x="24" y="13" width="8" height="3" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    automata: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <rect x="12" y="2" width="12" height="8" rx="1" fill={color} opacity="0.9"/>
        <circle cx="15" cy="6" r="2" fill={color} opacity="0.4"/>
        <circle cx="21" cy="6" r="2" fill={color} opacity="0.4"/>
        <rect x="9" y="10" width="18" height="14" rx="2" fill={color} opacity="0.8"/>
        <rect x="4" y="11" width="5" height="12" rx="1" fill={color} opacity="0.65"/>
        <rect x="27" y="11" width="5" height="12" rx="1" fill={color} opacity="0.65"/>
        <rect x="11" y="24" width="6" height="10" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="19" y="24" width="6" height="10" rx="1.5" fill={color} opacity="0.7"/>
      </svg>
    ),
    tech_elite: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="13" y="12" width="10" height="12" rx="2" fill={color} opacity="0.8"/>
        <circle cx="18" cy="17" r="3" fill={color} opacity="0.4"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="5" y="10" width="8" height="4" rx="1" fill={color} opacity="0.5"/>
        <rect x="23" y="10" width="8" height="4" rx="1" fill={color} opacity="0.5"/>
        <circle cx="9" cy="12" r="2" fill={color} opacity="0.6"/>
        <circle cx="27" cy="12" r="2" fill={color} opacity="0.6"/>
      </svg>
    ),
    custodes: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="4" fill={color} opacity="0.9"/>
        <path d="M18 1 L20 4 L18 3 L16 4 Z" fill={color} opacity="0.7"/>
        <rect x="13" y="11" width="10" height="13" rx="2" fill={color} opacity="0.85"/>
        <rect x="11" y="24" width="5" height="9" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="9" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="22" y="12" width="10" height="2.5" rx="1" fill={color} opacity="0.6"/>
        <rect x="6" y="8" width="3" height="18" rx="1" fill={color} opacity="0.5"/>
        <polygon points="7.5,4 9,8 6,8" fill={color} opacity="0.6"/>
      </svg>
    ),
    commander: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4.5" fill={color} opacity="0.9"/>
        <path d="M14 2 L18 0 L22 2 L20 5 H16 Z" fill={color} opacity="0.65"/>
        <rect x="13" y="12" width="10" height="13" rx="2" fill={color} opacity="0.85"/>
        <rect x="11" y="25" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="25" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="23" y="14" width="9" height="3" rx="1" fill={color} opacity="0.6"/>
        <rect x="4" y="13" width="9" height="6" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    primarch: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="5" r="4.5" fill={color} opacity="0.95"/>
        <path d="M12 0 L18 -2 L24 0 L21 4 H15 Z" fill={color} opacity="0.7"/>
        <rect x="11" y="10" width="14" height="15" rx="2" fill={color} opacity="0.9"/>
        <rect x="10" y="25" width="6" height="10" rx="2" fill={color} opacity="0.75"/>
        <rect x="20" y="25" width="6" height="10" rx="2" fill={color} opacity="0.75"/>
        <rect x="4" y="10" width="7" height="10" rx="2" fill={color} opacity="0.6"/>
        <rect x="25" y="10" width="7" height="10" rx="2" fill={color} opacity="0.6"/>
        <rect x="28" y="8" width="8" height="3" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    daemon: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="8" r="5" fill={color} opacity="0.9"/>
        <path d="M12 4 L10 0 L14 5 Z" fill={color} opacity="0.7"/>
        <path d="M24 4 L26 0 L22 5 Z" fill={color} opacity="0.7"/>
        <rect x="12" y="13" width="12" height="13" rx="2" fill={color} opacity="0.8"/>
        <rect x="10" y="26" width="6" height="9" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="26" width="6" height="9" rx="2" fill={color} opacity="0.7"/>
        <path d="M6 14 Q4 20 6 26" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
        <path d="M30 14 Q32 20 30 26" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
      </svg>
    ),
    ogryn: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="5" fill={color} opacity="0.9"/>
        <rect x="10" y="11" width="16" height="14" rx="3" fill={color} opacity="0.85"/>
        <rect x="9" y="25" width="7" height="10" rx="2" fill={color} opacity="0.7"/>
        <rect x="20" y="25" width="7" height="10" rx="2" fill={color} opacity="0.7"/>
        <rect x="4" y="12" width="6" height="10" rx="2" fill={color} opacity="0.6"/>
        <rect x="26" y="12" width="6" height="10" rx="2" fill={color} opacity="0.6"/>
      </svg>
    ),
    thrall: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="8" r="3.5" fill={color} opacity="0.7"/>
        <rect x="14" y="12" width="8" height="11" rx="1.5" fill={color} opacity="0.6"/>
        <rect x="12" y="23" width="5" height="8" rx="1" fill={color} opacity="0.5"/>
        <rect x="19" y="23" width="5" height="8" rx="1" fill={color} opacity="0.5"/>
        <rect x="22" y="14" width="8" height="2" rx="1" fill={color} opacity="0.4"/>
      </svg>
    ),
    destroyer: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <circle cx="18" cy="18" r="2" fill={color} opacity="0.4"/>
        <rect x="22" y="11" width="12" height="4" rx="1" fill={color} opacity="0.6"/>
        <circle cx="33" cy="13" r="2" fill={color} opacity="0.5"/>
      </svg>
    ),
    recon: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="3.5" fill={color} opacity="0.85"/>
        <rect x="14" y="11" width="8" height="11" rx="2" fill={color} opacity="0.7"/>
        <rect x="12" y="22" width="5" height="9" rx="1.5" fill={color} opacity="0.6"/>
        <rect x="19" y="22" width="5" height="9" rx="1.5" fill={color} opacity="0.6"/>
        <rect x="20" y="8" width="14" height="2.5" rx="1" fill={color} opacity="0.5"/>
        <circle cx="14" cy="5" r="2" fill={color} opacity="0.4"/>
      </svg>
    ),
    seeker: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="22" y="10" width="13" height="3" rx="1" fill={color} opacity="0.6"/>
        <circle cx="34" cy="11.5" r="1.5" fill={color} opacity="0.4"/>
        <path d="M16 3 L18 1 L20 3" stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
      </svg>
    ),
    breacher: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="4" y="8" width="10" height="16" rx="2" fill={color} opacity="0.55"/>
        <rect x="23" y="14" width="8" height="2.5" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    assault: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="7" r="4" fill={color} opacity="0.9"/>
        <rect x="14" y="12" width="8" height="12" rx="2" fill={color} opacity="0.8"/>
        <rect x="11" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="20" y="24" width="5" height="8" rx="1.5" fill={color} opacity="0.7"/>
        <rect x="8" y="6" width="4" height="14" rx="1" fill={color} opacity="0.5" transform="rotate(-20 10 13)"/>
        <rect x="22" y="14" width="8" height="2.5" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
  };
  return icons[type] || icons.infantry;
}

// ━━━ UNIT SELECTOR MODAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function UnitSelectorModal({ presets, onSelect, selectedId, onClose, accentColor = "#b8860b", title, isTarget = false }) {
  const [activeCategory, setActiveCategory] = useState(presets[0]?.category || "");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUnits = useMemo(() => {
    if (!searchTerm) {
      return presets.find(c => c.category === activeCategory)?.units || [];
    }
    const term = searchTerm.toLowerCase();
    return presets.flatMap(c => c.units).filter(u => u.name.toLowerCase().includes(term));
  }, [activeCategory, searchTerm, presets]);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.15s ease", padding: 16
    }} onClick={onClose}>
      <div style={{
        background: "#ffffff", borderRadius: 12, width: "100%", maxWidth: 700,
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        border: `2px solid ${accentColor}`, boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid #d0c4aa",
          background: `linear-gradient(180deg, rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.08) 0%, transparent 100%)`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: accentColor, letterSpacing: 2 }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20, color: "#8a7e6e", cursor: "pointer", padding: "2px 6px"
          }}>✕</button>
        </div>

        <div style={{ padding: "10px 18px", borderBottom: "1px solid #ece7de" }}>
          <input
            type="text" placeholder="Search units..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 13,
              border: "1px solid #d0c4aa", background: "#f9f6f0", color: "#2a2418",
              fontFamily: "'EB Garamond', serif"
            }}
          />
        </div>

        {!searchTerm && (
          <div style={{
            display: "flex", gap: 0, borderBottom: "1px solid #d0c4aa",
            overflowX: "auto", flexShrink: 0
          }}>
            {presets.map(cat => (
              <button key={cat.category} onClick={() => setActiveCategory(cat.category)} style={{
                padding: "8px 14px", fontSize: 10, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: activeCategory === cat.category ? 700 : 400,
                letterSpacing: 1, whiteSpace: "nowrap", border: "none", borderBottom: activeCategory === cat.category ? `2px solid ${accentColor}` : "2px solid transparent",
                background: activeCategory === cat.category ? `rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.08)` : "transparent",
                color: activeCategory === cat.category ? accentColor : "#8a7e6e",
                transition: "all 0.15s ease"
              }}>{cat.category}</button>
            ))}
          </div>
        )}

        <div style={{
          padding: 14, overflowY: "auto", flex: 1,
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8, alignContent: "start"
        }}>
          {filteredUnits.map(u => {
            const iconType = getUnitIconType(u.name);
            const uid = u.id || u.name;
            const isSelected = selectedId === uid;
            return (
              <button key={uid} onClick={() => onSelect(u)} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 8px 8px", borderRadius: 8, cursor: "pointer",
                background: isSelected ? `rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.12)` : "#f9f6f0",
                border: `1.5px solid ${isSelected ? accentColor : "#e0dbd0"}`,
                transition: "all 0.15s ease", textAlign: "center",
                boxShadow: isSelected ? `0 2px 8px rgba(${accentColor === "#b8860b" ? "184,134,11" : "42,111,180"},0.15)` : "none"
              }}>
                <UnitIcon type={iconType} size={32} color={isSelected ? accentColor : "#8a7e6e"} />
                <div style={{
                  fontSize: 11, fontFamily: "'Cinzel', serif", fontWeight: 600,
                  color: isSelected ? "#2a2418" : "#4a4030", marginTop: 4, lineHeight: 1.2,
                  minHeight: 26, display: "flex", alignItems: "center"
                }}>{u.name}</div>
                <div style={{
                  fontSize: 9, color: "#8a7e6e", fontFamily: "'Cinzel', serif",
                  marginTop: 3, letterSpacing: 0.5
                }}>
                  {isTarget
                    ? `T${u.t} ${u.w}W Sv${u.sv}+ ${u.inv !== "-" ? `Inv${u.inv}+` : ""} ${u.fnp !== "-" ? `FNP${u.fnp}+` : ""} Ld${u.ld || "?"}`
                    : `${u.models} model${u.models > 1 ? "s" : ""} · BS${u.bs}`
                  }
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ━━━ WEAPON SELECTOR (inline, shown after unit is picked) ━━━━━━━━━━━━━━━━━━━

function WeaponSelector({ weapons, selectedWeaponName, onSelect }) {
  if (!weapons || weapons.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>Weapon Loadout</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {weapons.map(w => {
          const active = selectedWeaponName === w.name;
          return (
            <button key={w.name} onClick={() => onSelect(w)} style={{
              padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
              background: active ? "rgba(184,134,11,0.18)" : "#f0ebe2",
              border: `1.5px solid ${active ? "#b8860b" : "#d0c4aa"}`,
              color: active ? "#b8860b" : "#6a5e4e",
              transition: "all 0.15s ease", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 2, minWidth: 120,
            }}>
              <div style={{ fontWeight: 600 }}>{w.name}</div>
              <div style={{ fontSize: 9, color: active ? "#8b6508" : "#8a7e6e", letterSpacing: 0.5 }}>
                {w.type} {w.shots} · S{w.s} AP{w.ap} D{w.damage}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ━━━ UI COMPONENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const phaseColors = {
  "Setup": "#6a6a6a",
  "To Hit": "#b8860b",
  "To Wound": "#b83030",
  "Saves": "#2a6fb4",
  "FNP": "#6b3fa0",
  "Special": "#c46a1b",
  "Sergeant": "#6b3f8a",
  "Checks": "#8b5a2b",
  "Result": "#2e7d32",
  "Charge": "#9b2d2d",
  "Volley Fire": "#6b8e23",
  "Return Fire": "#8b4513",
  "Overwatch": "#c46a1b",
  "Melee": "#7a1e1e",
  "Combat Res": "#4a148c"
};

const phaseIcons = {
  "Setup": "⚙",
  "To Hit": "🎯",
  "To Wound": "⚔",
  "Saves": "🛡",
  "FNP": "💜",
  "Special": "✦",
  "Sergeant": "⚔",
  "Checks": "📋",
  "Result": "☠",
  "Charge": "🏃",
  "Volley Fire": "🔫",
  "Return Fire": "🎯",
  "Overwatch": "🔥",
  "Melee": "⚔",
  "Combat Res": "⚖"
};

function DieIcon({ value, success, reroll, small }) {
  const sz = small ? 22 : 28;
  const faces = {
    1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: sz, height: sz, fontSize: sz - 6,
      borderRadius: 4, margin: 1,
      background: success ? "rgba(46,125,50,0.15)" : "rgba(200,50,50,0.1)",
      border: `1px solid ${success ? "#2e7d32" : "#c74040"}`,
      color: success ? "#2e7d32" : "#c74040",
      opacity: reroll ? 0.7 : 1,
      position: "relative"
    }} title={`${value}${reroll ? " (re-roll)" : ""}`}>
      {faces[value]}
      {reroll && <span style={{ position: "absolute", top: -3, right: -3, fontSize: 8, color: "#b8860b" }}>↻</span>}
    </span>
  );
}

function NumberInput({ label, value, onChange, min = 0, max = 20, step = 1 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => onChange(Math.max(min, value - step))} style={stepBtnStyle}>−</button>
        <input type="number" value={value} onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
          style={{ width: 48, textAlign: "center", background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 4px", fontSize: 16, fontFamily: "'Cinzel', serif" }} />
        <button onClick={() => onChange(Math.min(max, value + step))} style={stepBtnStyle}>+</button>
      </div>
    </div>
  );
}

const stepBtnStyle = {
  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
  background: "#ece7de", border: "1px solid #d0c4aa", borderRadius: 4, color: "#8b6508",
  cursor: "pointer", fontSize: 16, fontFamily: "'Cinzel', serif"
};

function SelectInput({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: "#f0ebe2", border: "1px solid #c0b498", borderRadius: 4, color: "#2a2418", padding: "6px 8px", fontSize: 13, fontFamily: "'Cinzel', serif" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ToggleChip({ active, label, desc, onClick }) {
  return (
    <button onClick={onClick} title={desc} style={{
      padding: "5px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
      background: active ? "rgba(184,134,11,0.2)" : "#f0ebe2",
      border: `1px solid ${active ? "#b8860b" : "#d0c4aa"}`,
      color: active ? "#b8860b" : "#8a7e6e",
      transition: "all 0.15s ease",
      fontFamily: "'Cinzel', serif"
    }}>{label}</button>
  );
}

function CheckToggle({ checked, label, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#4a4030", fontFamily: "'Cinzel', serif" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ accentColor: "#b8860b" }} />
      {label}
    </label>
  );
}

// ━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function ShootingResolver() {
  // ━━ PHASE SELECTOR ━━
  const [activePhase, setActivePhase] = useState("shooting"); // "shooting" or "assault"

  // ━━ TACTICAL MAP STATE (shared across shooting/assault) ━━
  const [mapAttackerId, setMapAttackerId] = useState(null);
  const [mapTargetId, setMapTargetId] = useState(null);
  const [showTacticalMap, setShowTacticalMap] = useState(true);
  const [unitFacings, setUnitFacings] = useState({}); // { unitId: degrees }
  const [routedUnits, setRoutedUnits] = useState(new Set());
  const shootMapRef = useRef(null);
  const assaultMapRef = useRef(null);

  // Initialize facing based on player (P1 faces down, P2 faces up)
  const getUnitFacing = (unit) => unitFacings[unit.id] ?? (unit.player === "p1" ? 180 : 0);

  const setUnitFacing = (id, deg) => setUnitFacings(prev => ({ ...prev, [id]: deg }));

  // Calculate distance between two deployed units
  const getDistanceBetween = (u1, u2) => {
    if (!u1 || !u2) return null;
    return Math.round(Math.sqrt((u2.x - u1.x) ** 2 + (u2.y - u1.y) ** 2) * 10) / 10;
  };

  // Get angle from u1 to u2 in degrees
  const getAngleBetween = (u1, u2) => {
    if (!u1 || !u2) return 0;
    return Math.atan2(u2.y - u1.y, u2.x - u1.x) * 180 / Math.PI;
  };

  // Select attacker from map for shooting phase
  const handleMapAttackerSelect = (unit) => {
    setMapAttackerId(unit.id);
    // Auto-populate shooting stats from deployed unit data
    if (unit.unitData) {
      const ud = unit.unitData;
      // Shooting phase: use applyUnitPreset for full integration
      applyUnitPreset(ud);
      setNumModels(ud.models || 1);
      setBs(ud.bs || 4);
      if (unit.rangedWeapon) {
        applyWeaponPreset(unit.rangedWeapon);
      }
      if (unit.sgtEnabled && unit.sgtWeapon) {
        setSgtEnabled(true);
        setSgtWeapon(unit.sgtWeapon);
      }
      // Assault phase: set attacker melee stats
      setAUnit(ud);
      setAModels(ud.models || 1);
      setAT(ud.t || 4);
      setAW(ud.w || 1);
      setASv(ud.sv || "3");
      setAInv(ud.inv || "-");
      setAFnp(ud.fnp || "-");
      if (unit.meleeWeapon) {
        setAWS(unit.meleeWeapon.ws);
        setAS(unit.meleeWeapon.s);
        setAAP(unit.meleeWeapon.ap);
        setAI(unit.meleeWeapon.i);
        setAA(unit.meleeWeapon.a);
      }
    }
  };

  // Select target from map
  const handleMapTargetSelect = (unit) => {
    setMapTargetId(unit.id);
    if (unit.unitData) {
      const ud = unit.unitData;
      // Shooting target
      applyTargetPreset(ud);
      // Equipment flags for target
      setTargetHasVexilla(unit.equipment?.vexilla || false);
      setTargetHasNoxVox(unit.equipment?.noxVox || false);
      // Assault defender
      setDUnit(ud);
      setDModels(ud.models || 1);
      setDT(ud.t || 4);
      setDW(ud.w || 1);
      setDSv(ud.sv || "3");
      setDInv(ud.inv || "-");
      setDFnp(ud.fnp || "-");
      if (unit.meleeWeapon) {
        setDWS(unit.meleeWeapon.ws);
        setDS(unit.meleeWeapon.s);
        setDAP(unit.meleeWeapon.ap);
        setDI(unit.meleeWeapon.i);
        setDA(unit.meleeWeapon.a);
      }
    }
    // Auto-set charge distance from map
    const atkUnit = deployedUnits.find(u => u.id === mapAttackerId);
    if (atkUnit) {
      const dist = getDistanceBetween(atkUnit, unit);
      if (dist !== null) {
        setChargeDistance(Math.ceil(dist));
      }
      const angle = getAngleBetween(atkUnit, unit);
      setUnitFacing(atkUnit.id, angle + 90);
    }
  };

  // After charge resolves, move the charger toward the target
  const applyChargeMovement = (chargeRes) => {
    if (!chargeRes || !chargeRes.chargeSucceeded) return;
    const atkUnit = deployedUnits.find(u => u.id === mapAttackerId);
    const defUnit = deployedUnits.find(u => u.id === mapTargetId);
    if (!atkUnit || !defUnit) return;
    // Move attacker to 1" from defender (contact)
    const dist = getDistanceBetween(atkUnit, defUnit);
    if (dist <= 1) return;
    const ratio = Math.max(0, (dist - 1)) / dist;
    const newX = Math.round((atkUnit.x + (defUnit.x - atkUnit.x) * ratio) * 2) / 2;
    const newY = Math.round((atkUnit.y + (defUnit.y - atkUnit.y) * ratio) * 2) / 2;
    setDeployedUnits(prev => prev.map(u => u.id === atkUnit.id ? { ...u, x: newX, y: newY } : u));
    const angle = getAngleBetween(atkUnit, defUnit);
    setUnitFacing(atkUnit.id, angle + 90);
  };

  // Rout: move unit toward their deployment zone edge
  const routUnit = (unitId) => {
    setRoutedUnits(prev => new Set([...prev, unitId]));
    const unit = deployedUnits.find(u => u.id === unitId);
    if (!unit) return;
    // Move toward own deployment zone edge (P1=top y=0, P2=bottom y=48)
    const retreatY = unit.player === "p1" ? Math.max(0, unit.y - 6) : Math.min(BOARD_H, unit.y + 6);
    setDeployedUnits(prev => prev.map(u => u.id === unitId ? { ...u, y: retreatY } : u));
    // Face away from enemy
    setUnitFacing(unitId, unit.player === "p1" ? 0 : 180);
  };

  // Get weapon max range for display
  const getWeaponRange = (weapon) => {
    if (!weapon) return 0;
    const t = weapon.type || "";
    if (t === "Pistol") return 12;
    if (t === "Assault") return 12;
    if (t === "Rapid Fire") return 24;
    if (t === "Heavy") return 36;
    if (t === "Salvo") return 24;
    if (t === "Ordnance") return 48;
    if (t === "Barrage") return 48;
    return 24;
  };

  // Shared tactical map for shooting/assault
  const renderTacticalMap = ({ refObj, phase, onUnitClick }) => {
    const atkUnit = deployedUnits.find(u => u.id === mapAttackerId);
    const defUnit = deployedUnits.find(u => u.id === mapTargetId);
    const weaponRange = phase === "shooting" && atkUnit?.rangedWeapon ? getWeaponRange(atkUnit.rangedWeapon) : 0;
    const distance = getDistanceBetween(atkUnit, defUnit);

    return (
      <div style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: phase === "shooting" ? "#b8860b" : "#9b2d2d", fontSize: 16 }}>🗺</span>
            <span style={{ color: phase === "shooting" ? "#b8860b" : "#9b2d2d" }}>TACTICAL MAP</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {distance !== null && atkUnit && defUnit && (
              <span style={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: "#6a5e4e" }}>
                Range: <strong style={{ color: phase === "shooting" ? "#b8860b" : "#9b2d2d" }}>{distance}"</strong>
                {phase === "shooting" && weaponRange > 0 && (
                  <span style={{ color: distance <= weaponRange ? "#2e7d32" : "#c74040", marginLeft: 4 }}>
                    {distance <= weaponRange ? "✓ IN RANGE" : "✗ OUT OF RANGE"}
                  </span>
                )}
              </span>
            )}
            <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>Zoom:</span>
            {[6, 8, 10, 12].map(z => (
              <button key={z} onClick={() => setDeployScale(z)} style={{
                padding: "2px 6px", borderRadius: 3, fontSize: 8, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: deployScale === z ? 700 : 400,
                background: deployScale === z ? "rgba(0,0,0,0.08)" : "#f0ebe2",
                border: `1px solid ${deployScale === z ? "#8a7e6e" : "#d0c4aa"}`,
                color: deployScale === z ? "#2a2418" : "#8a7e6e",
              }}>{z}px</button>
            ))}
          </div>
        </div>

        {deployedUnits.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", fontSize: 11, color: "#a09888", fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>
            No units on board. Deploy units in the Deployment Phase first.
          </div>
        ) : (
          <div style={{ overflow: "auto", maxHeight: "50vh", background: "#2a2a20", borderRadius: 4 }}>
            <div ref={refObj} onClick={(e) => {
              // Click empty space to deselect
              if (e.target === e.currentTarget || e.target === refObj.current) {
                // noop — deselection not needed
              }
            }} style={{
              position: "relative",
              width: BOARD_W * deployScale, height: BOARD_H * deployScale,
              background: "#3a3a2e", margin: "0 auto",
            }}>
              {/* 1-inch texture */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.06,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px), repeating-linear-gradient(90deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px)`,
                pointerEvents: "none",
              }} />

              {/* Grid lines every 6" */}
              {deployShowGrid && Array.from({ length: Math.floor(BOARD_W / 6) + 1 }, (_, i) => (
                <div key={`gv${i}`} style={{
                  position: "absolute", left: i * 6 * deployScale, top: 0,
                  width: 1, height: BOARD_H * deployScale,
                  background: "rgba(255,255,255,0.06)", pointerEvents: "none",
                }} />
              ))}
              {deployShowGrid && Array.from({ length: Math.floor(BOARD_H / 6) + 1 }, (_, i) => (
                <div key={`gh${i}`} style={{
                  position: "absolute", top: i * 6 * deployScale, left: 0,
                  height: 1, width: BOARD_W * deployScale,
                  background: "rgba(255,255,255,0.06)", pointerEvents: "none",
                }} />
              ))}

              {/* Weapon range circle from attacker */}
              {phase === "shooting" && atkUnit && weaponRange > 0 && (
                <div style={{
                  position: "absolute",
                  left: atkUnit.x * deployScale - weaponRange * deployScale,
                  top: atkUnit.y * deployScale - weaponRange * deployScale,
                  width: weaponRange * 2 * deployScale,
                  height: weaponRange * 2 * deployScale,
                  borderRadius: "50%",
                  border: "1.5px dashed rgba(184,134,11,0.35)",
                  background: "rgba(184,134,11,0.04)",
                  pointerEvents: "none",
                }} />
              )}

              {/* Charge range circle (9" max) */}
              {phase === "assault" && atkUnit && (
                <div style={{
                  position: "absolute",
                  left: atkUnit.x * deployScale - 9 * deployScale,
                  top: atkUnit.y * deployScale - 9 * deployScale,
                  width: 18 * deployScale, height: 18 * deployScale,
                  borderRadius: "50%",
                  border: "1.5px dashed rgba(155,45,45,0.35)",
                  background: "rgba(155,45,45,0.03)",
                  pointerEvents: "none",
                }} />
              )}

              {/* Line between attacker and target */}
              {atkUnit && defUnit && (
                <svg style={{ position: "absolute", inset: 0, width: BOARD_W * deployScale, height: BOARD_H * deployScale, pointerEvents: "none" }}>
                  <line
                    x1={atkUnit.x * deployScale} y1={atkUnit.y * deployScale}
                    x2={defUnit.x * deployScale} y2={defUnit.y * deployScale}
                    stroke={phase === "shooting" ? "rgba(184,134,11,0.5)" : "rgba(155,45,45,0.5)"}
                    strokeWidth={2} strokeDasharray="6,4"
                  />
                  {/* Distance label at midpoint */}
                  {distance && (
                    <text
                      x={(atkUnit.x + defUnit.x) / 2 * deployScale}
                      y={(atkUnit.y + defUnit.y) / 2 * deployScale - 6}
                      fill="#ffd700" fontSize="10" fontFamily="Cinzel" textAnchor="middle"
                    >{distance}"</text>
                  )}
                </svg>
              )}

              {/* Terrain Pieces */}
              {terrainPieces.map(terrain => {
                const ttype = TERRAIN_TYPES.find(t => t.id === terrain.type);
                return (
                  <div key={terrain.id} style={{
                    position: "absolute",
                    left: terrain.x * deployScale, top: terrain.y * deployScale,
                    width: terrain.w * deployScale, height: terrain.h * deployScale,
                    background: terrain.bg, border: `2px solid ${terrain.border}`,
                    borderRadius: terrain.type === "fortification" ? 3 : 6,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    pointerEvents: "none", zIndex: 2,
                  }}>
                    <div style={{ fontSize: Math.max(terrain.w * deployScale * 0.22, 8), color: terrain.color, lineHeight: 1 }}>
                      {ttype?.symbol}
                    </div>
                    {terrain.w * deployScale > 40 && (
                      <div style={{ fontSize: 6, color: terrain.color, fontFamily: "'Cinzel', serif", fontWeight: 700, textAlign: "center", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                        {terrain.w}″×{terrain.h}″
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Units */}
              {deployedUnits.map(unit => {
                const isP1 = unit.player === "p1";
                const col = isP1 ? "#e05555" : "#5599dd";
                const bgCol = isP1 ? "rgba(200,60,60,0.85)" : "rgba(50,120,200,0.85)";
                const sz = Math.max(deployScale * 1.6, 16);
                const isAtk = unit.id === mapAttackerId;
                const isDef = unit.id === mapTargetId;
                const isRouted = routedUnits.has(unit.id);
                const facing = getUnitFacing(unit);

                return (
                  <div key={unit.id} style={{ position: "absolute", left: unit.x * deployScale - sz / 2, top: unit.y * deployScale - sz / 2 }}>
                    {/* Facing arrow */}
                    <div style={{
                      position: "absolute", left: sz / 2, top: -4, width: 0, height: 0,
                      transform: `translate(-50%, -100%) rotate(${facing}deg)`,
                      transformOrigin: `50% ${sz / 2 + 4}px`,
                      borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                      borderBottom: `8px solid ${isRouted ? "#ff6600" : isAtk ? "#ffd700" : isDef ? "#ff4444" : "rgba(255,255,255,0.3)"}`,
                      pointerEvents: "none", zIndex: 15,
                    }} />
                    {/* Unit token */}
                    <div
                      onClick={(e) => { e.stopPropagation(); onUnitClick && onUnitClick(unit); }}
                      title={`${unit.label} (${unit.player.toUpperCase()}) ${unit.x}",${unit.y}"${isRouted ? " — ROUTED" : ""}`}
                      style={{
                        width: sz, height: sz,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: unit.type === "tank" || unit.type === "transport" ? 3 : unit.type === "objective" ? "50%" : 4,
                        background: isRouted ? "rgba(255,102,0,0.85)" : unit.type === "objective" ? "rgba(255,215,0,0.85)" : bgCol,
                        border: isAtk ? "2.5px solid #ffd700" : isDef ? "2.5px solid #ff4444" : `1.5px solid ${unit.type === "objective" ? "#ffd700" : col}`,
                        color: unit.type === "objective" ? "#2a2418" : "#fff",
                        fontSize: Math.max(sz * 0.55, 10), fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: isAtk ? "0 0 12px rgba(255,215,0,0.6)" : isDef ? "0 0 12px rgba(255,68,68,0.6)" : "0 1px 4px rgba(0,0,0,0.4)",
                        zIndex: isAtk || isDef ? 20 : 10, lineHeight: 1,
                        opacity: isRouted ? 0.7 : 1,
                      }}
                    >
                      {unit.symbol}
                    </div>
                  </div>
                );
              })}

              {/* Board border */}
              <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(255,255,255,0.2)", borderRadius: 2, pointerEvents: "none" }} />
            </div>
          </div>
        )}

        {/* Map selection info bar */}
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <div style={{
            flex: 1, padding: "6px 10px", borderRadius: 4, fontSize: 10,
            background: mapAttackerId ? "rgba(255,215,0,0.08)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${mapAttackerId ? "rgba(255,215,0,0.3)" : "#e0d8c8"}`,
          }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8, color: "#b8860b", letterSpacing: 1 }}>⚔ ATTACKER: </span>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 10, color: mapAttackerId ? "#2a2418" : "#a09888" }}>
              {atkUnit?.label || "Click a unit on the map"}
            </span>
          </div>
          <div style={{
            flex: 1, padding: "6px 10px", borderRadius: 4, fontSize: 10,
            background: mapTargetId ? "rgba(255,68,68,0.08)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${mapTargetId ? "rgba(255,68,68,0.3)" : "#e0d8c8"}`,
          }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8, color: "#c74040", letterSpacing: 1 }}>🎯 TARGET: </span>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 10, color: mapTargetId ? "#2a2418" : "#a09888" }}>
              {defUnit?.label || "Click another unit"}
            </span>
          </div>
          <button onClick={() => { setMapAttackerId(null); setMapTargetId(null); }} style={{
            padding: "4px 10px", borderRadius: 4, fontSize: 8, cursor: "pointer",
            fontFamily: "'Cinzel', serif", fontWeight: 600,
            background: "#f0ebe2", border: "1px solid #d0c4aa", color: "#8a7e6e",
          }}>CLEAR</button>
        </div>
      </div>
    );
  };

  // ━━ ASSAULT PHASE STATE ━━
  const [assaultResult, setAssaultResult] = useState(null);
  // Attacker
  const [aUnit, setAUnit] = useState(null);
  const [aShowPresets, setAShowPresets] = useState(false);
  const [aSelectedMelee, setASelectedMelee] = useState(null);
  const [aModels, setAModels] = useState(10);
  const [aWS, setAWS] = useState(4);
  const [aS, setAS] = useState(4);
  const [aAP, setAAP] = useState("-");
  const [aI, setAI] = useState(4);
  const [aA, setAA] = useState(1);
  const [aW, setAW] = useState(1);
  const [aT, setAT] = useState(4);
  const [aSv, setASv] = useState("3");
  const [aInv, setAInv] = useState("-");
  const [aFnp, setAFnp] = useState("-");
  const [aRules, setARules] = useState({});
  // Defender
  const [dUnit, setDUnit] = useState(null);
  const [dShowPresets, setDShowPresets] = useState(false);
  const [dSelectedMelee, setDSelectedMelee] = useState(null);
  const [dModels, setDModels] = useState(10);
  const [dWS, setDWS] = useState(4);
  const [dS, setDS] = useState(4);
  const [dAP, setDAP] = useState("-");
  const [dI, setDI] = useState(4);
  const [dA, setDA] = useState(1);
  const [dW, setDW] = useState(1);
  const [dT, setDT] = useState(4);
  const [dSv, setDSv] = useState("3");
  const [dInv, setDInv] = useState("-");
  const [dFnp, setDFnp] = useState("-");
  const [dRules, setDRules] = useState({});
  // Options
  const [assaultCharging, setAssaultCharging] = useState(true);
  const [assaultDisordered, setAssaultDisordered] = useState(false);

  // Challenge sub-phase
  const [challengeEnabled, setChallengeEnabled] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [atkGambit, setAtkGambit] = useState("none");
  const [defGambit, setDefGambit] = useState("none");
  const [atkSupport, setAtkSupport] = useState(0);
  const [defSupport, setDefSupport] = useState(0);

  const handleChallengeResolve = () => {
    const res = resolveChallenge({
      atkWS: aWS, atkS: aS, atkAP: aAP, atkI: aI, atkA: aA, atkW: aW, atkT: aT,
      atkSv: aSv, atkInv: aInv, atkFnp: aFnp, atkRules: aRules,
      atkGambit, atkName: aUnit?.name || "Attacker Champion",
      defWS: dWS, defS: dS, defAP: dAP, defI: dI, defA: dA, defW: dW, defT: dT,
      defSv: dSv, defInv: dInv, defFnp: dFnp, defRules: dRules,
      defGambit, defName: dUnit?.name || "Defender Champion",
      atkSupport, defSupport, isCharging: assaultCharging,
    });
    setChallengeResult(res);
    // Track kills
    const chAtkName = aUnit?.name || "Attacker Champion";
    const chDefName = dUnit?.name || "Defender Champion";
    const challengeKills = [];
    if (res.atkWoundsDealt > 0) {
      challengeKills.push({ phase: "Challenge", attacker: chAtkName, target: chDefName, casualties: res.atkWoundsDealt, detail: `Challenge: ${chAtkName} → ${chDefName}: ${res.atkWoundsDealt} wound(s)${res.defSlain ? " — SLAIN!" : ""}` });
    }
    if (res.defWoundsDealt > 0) {
      challengeKills.push({ phase: "Challenge", attacker: chDefName, target: chAtkName, casualties: res.defWoundsDealt, detail: `Challenge: ${chDefName} → ${chAtkName}: ${res.defWoundsDealt} wound(s)${res.atkSlain ? " — SLAIN!" : ""}` });
    }
    if (challengeKills.length > 0) setRoundKills(prev => [...prev, ...challengeKills]);
  };

  const [currentRound, setCurrentRound] = useState(1);
  const [vpLog, setVpLog] = useState([]);
  const [p1TotalVP, setP1TotalVP] = useState(0);
  const [p2TotalVP, setP2TotalVP] = useState(0);
  // Objectives: up to 6, each has value 1-3, controlled by "none"/"p1"/"p2", line bonus
  const [objectives, setObjectives] = useState([
    { id: 1, value: 1, controller: "none", line: 0 },
    { id: 2, value: 1, controller: "none", line: 0 },
    { id: 3, value: 2, controller: "none", line: 0 },
  ]);
  const [numObjectives, setNumObjectives] = useState(3);
  // Secondaries
  const [p1Secondaries, setP1Secondaries] = useState({ slayWarlord: false, giantKiller: false, firstStrike: false, lastManStanding: false });
  const [p2Secondaries, setP2Secondaries] = useState({ slayWarlord: false, giantKiller: false, firstStrike: false, lastManStanding: false });
  const [secondaryValues, setSecondaryValues] = useState({ slayWarlord: 3, giantKiller: 3, firstStrike: 3, lastManStanding: 3 });
  // Status Recovery
  const [statusRecoveries, setStatusRecoveries] = useState([]);
  // Kill Tracker
  const [roundKills, setRoundKills] = useState([]);

  const updateObjective = (idx, field, val) => {
    setObjectives(prev => prev.map((o, i) => i === idx ? { ...o, [field]: val } : o));
  };

  const handleNumObjectivesChange = (n) => {
    setNumObjectives(n);
    setObjectives(prev => {
      if (n > prev.length) {
        return [...prev, ...Array.from({ length: n - prev.length }, (_, i) => ({ id: prev.length + i + 1, value: 1, controller: "none", line: 0 }))];
      }
      return prev.slice(0, n);
    });
  };

  const scoreRound = () => {
    let p1Round = 0, p2Round = 0;
    const roundLog = [];

    // Primary objectives
    objectives.forEach((obj, i) => {
      if (obj.controller === "p1") {
        const vp = obj.value + obj.line;
        p1Round += vp;
        roundLog.push(`Obj ${i + 1}: Player 1 scores ${vp} VP${obj.line > 0 ? ` (${obj.value} + Line ${obj.line})` : ""}`);
      } else if (obj.controller === "p2") {
        const vp = obj.value + obj.line;
        p2Round += vp;
        roundLog.push(`Obj ${i + 1}: Player 2 scores ${vp} VP${obj.line > 0 ? ` (${obj.value} + Line ${obj.line})` : ""}`);
      }
    });

    const entry = { round: currentRound, p1: p1Round, p2: p2Round, log: roundLog };
    setVpLog(prev => [...prev, entry]);
    setP1TotalVP(prev => prev + p1Round);
    setP2TotalVP(prev => prev + p2Round);
    setCurrentRound(prev => prev + 1);
  };

  const rollStatusRecovery = (unitName, stat, statValue, hasNox) => {
    const effectiveValue = hasNox ? Math.min(statValue + 1, 12) : statValue;
    const dice = rollD6s(2);
    const total = dice[0] + dice[1];
    const passed = total <= effectiveValue;
    setStatusRecoveries(prev => [...prev, { round: currentRound, unitName, stat, statValue: effectiveValue, baseValue: statValue, hasNox, dice, total, passed }]);
  };

  const calcSecondaryVP = (secondaries) => {
    let vp = 0;
    if (secondaries.slayWarlord) vp += secondaryValues.slayWarlord;
    if (secondaries.giantKiller) vp += secondaryValues.giantKiller;
    if (secondaries.firstStrike) vp += secondaryValues.firstStrike;
    if (secondaries.lastManStanding) vp += secondaryValues.lastManStanding;
    return vp;
  };

  // ━━ DEPLOYMENT STATE ━━
  const BOARD_W = 72; // inches
  const BOARD_H = 48; // inches
  const [deployScale, setDeployScale] = useState(10); // px per inch
  const [deployedUnits, setDeployedUnits] = useState([]);
  const [deploySelectedUnit, setDeploySelectedUnit] = useState(null);
  const [deployPlayer, setDeployPlayer] = useState("p1"); // p1 or p2
  const [deployBrushUnit, setDeployBrushUnit] = useState(null); // full unit from UNIT_PRESETS
  const [deployBrushModels, setDeployBrushModels] = useState(1); // adjustable squad size
  const [deployBrushRangedWeapon, setDeployBrushRangedWeapon] = useState(null);
  const [deployBrushMeleeWeapon, setDeployBrushMeleeWeapon] = useState(null);
  const [deployBrushSgtEnabled, setDeployBrushSgtEnabled] = useState(false);
  const [deployBrushSgtWeapon, setDeployBrushSgtWeapon] = useState(null);
  const [deployBrushEquipment, setDeployBrushEquipment] = useState({ vexilla: false, noxVox: false, metaBomb: false });
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  const deployRangedWeapons = useMemo(() => deployBrushUnit ? (WEAPON_PROFILES[deployBrushUnit.id] || []) : [], [deployBrushUnit]);
  const deployMeleeWeapons = useMemo(() => deployBrushUnit ? (MELEE_WEAPON_PROFILES[deployBrushUnit.id] || []) : [], [deployBrushUnit]);
  const deploySgtCategory = useMemo(() => deployBrushUnit ? getSgtCategory(deployBrushUnit.id) : null, [deployBrushUnit]);
  const deploySgtWeapons = useMemo(() => deploySgtCategory ? (SERGEANT_WEAPONS[deploySgtCategory] || []) : [], [deploySgtCategory]);
  const [deployShowGrid, setDeployShowGrid] = useState(true);
  const [deployShowZones, setDeployShowZones] = useState(true);
  const [deployZoneDepth, setDeployZoneDepth] = useState(12); // deployment zone depth in inches
  const [missionType, setMissionType] = useState("search"); // "search" | "hammer" | "dawn"
  const boardRef = useRef(null);

  // Mission definitions
  const MISSIONS = {
    search: {
      id: "search", name: "Search and Destroy",
      desc: "Diagonal deployment. Side A deploys in the top-left corner (36\"×24\"), Side B in the bottom-right corner (36\"×24\"). Units cannot deploy within 18\" of the board centre.",
      renderZones: (scale) => [
        // Side A: top-left rectangle 36" wide, 24" tall
        { left: 0, top: 0, width: 36 * scale, height: 24 * scale,
          color: "rgba(155,45,45,0.15)", border: "2px dashed rgba(155,45,45,0.5)",
          label: "P1 ZONE (36\"×24\")", labelStyle: { top: 4, left: 8, color: "rgba(155,45,45,0.7)" } },
        // Side B: bottom-right rectangle 36" wide, 24" tall
        { left: (BOARD_W - 36) * scale, top: (BOARD_H - 24) * scale, width: 36 * scale, height: 24 * scale,
          color: "rgba(42,111,180,0.15)", border: "2px dashed rgba(42,111,180,0.5)",
          label: "P2 ZONE (36\"×24\")", labelStyle: { bottom: 4, right: 8, color: "rgba(42,111,180,0.7)" } },
      ],
      exclusionCircle: true, // 18" diameter = 9" radius from centre
    },
    hammer: {
      id: "hammer", name: "Hammer and Anvil",
      desc: "Side deployment. Each player deploys in a 24\"×48\" zone on opposite long edges.",
      renderZones: (scale) => [
        { left: 0, top: 0, width: 24 * scale, height: BOARD_H * scale,
          color: "rgba(155,45,45,0.15)", border: "2px dashed rgba(155,45,45,0.5)",
          label: "P1 ZONE (24\")", labelStyle: { top: "50%", left: 4, transform: "translateY(-50%)", color: "rgba(155,45,45,0.7)" } },
        { left: (BOARD_W - 24) * scale, top: 0, width: 24 * scale, height: BOARD_H * scale,
          color: "rgba(42,111,180,0.15)", border: "2px dashed rgba(42,111,180,0.5)",
          label: "P2 ZONE (24\")", labelStyle: { top: "50%", right: 4, transform: "translateY(-50%)", color: "rgba(42,111,180,0.7)" } },
      ],
    },
    dawn: {
      id: "dawn", name: "Dawn of War",
      desc: "Long-edge deployment. Each player deploys in a 12\"×72\" strip along opposite long edges.",
      renderZones: (scale) => [
        { left: 0, top: 0, width: BOARD_W * scale, height: 12 * scale,
          color: "rgba(155,45,45,0.15)", border: "2px dashed rgba(155,45,45,0.5)",
          label: "P1 ZONE (12\")", labelStyle: { top: 4, left: 8, color: "rgba(155,45,45,0.7)" } },
        { left: 0, top: (BOARD_H - 12) * scale, width: BOARD_W * scale, height: 12 * scale,
          color: "rgba(42,111,180,0.15)", border: "2px dashed rgba(42,111,180,0.5)",
          label: "P2 ZONE (12\")", labelStyle: { bottom: 4, right: 8, color: "rgba(42,111,180,0.7)" } },
      ],
    },
  };

  // Objective markers state: { id, x, y, value (2 or 3), label }
  const [objectiveMarkers, setObjectiveMarkers] = useState([]);
  const [placingObjective, setPlacingObjective] = useState(false);
  const [objValue, setObjValue] = useState(2); // 2 or 3 VP
  const [objCounter, setObjCounter] = useState(1);

  const DEPLOY_UNIT_TYPES = [
    { id: "infantry", label: "Infantry", symbol: "╬", desc: "Tactical, Despoiler, etc." },
    { id: "assault", label: "Assault", symbol: "⚔", desc: "Assault Marines, Rampagers" },
    { id: "breacher", label: "Breacher", symbol: "▣", desc: "Breacher Squads" },
    { id: "terminator", label: "Terminator", symbol: "◆", desc: "Cataphractii, Tartaros, etc." },
    { id: "commander", label: "HQ / Command", symbol: "★", desc: "Praetor, Centurion, Consul" },
    { id: "primarch", label: "Primarch", symbol: "✦", desc: "Primarch / Paragon" },
    { id: "recon", label: "Recon / Scout", symbol: "◎", desc: "Recon, Seekers, Pathfinders" },
    { id: "heavy_support", label: "Heavy Support", symbol: "▲", desc: "Heavy Squads, Havocs" },
    { id: "dreadnought", label: "Dreadnought", symbol: "⬡", desc: "Contemptor, Leviathan, etc." },
    { id: "tank", label: "Vehicle / Tank", symbol: "▬", desc: "Predator, Sicaran, Land Raider" },
    { id: "artillery", label: "Artillery", symbol: "▽", desc: "Rapier, Whirlwind, Basilisk" },
    { id: "flyer", label: "Flyer", symbol: "✈", desc: "Storm Eagle, Fire Raptor" },
    { id: "transport", label: "Transport", symbol: "◻", desc: "Rhino, Drop Pod, Spartan" },
    { id: "custodes", label: "Custodes", symbol: "⛊", desc: "Custodian Guard, Sentinel" },
    { id: "automata", label: "Automata", symbol: "⬢", desc: "Castellax, Vorax, Thanatar" },
    { id: "objective", label: "Objective", symbol: "⊕", desc: "Objective Marker" },
    { id: "daemon", label: "Daemon", symbol: "⁂", desc: "Daemon units" },
    { id: "seeker", label: "Seeker", symbol: "◉", desc: "Seeker Squads" },
    { id: "destroyer", label: "Destroyer", symbol: "☢", desc: "Destroyer Squads" },
    { id: "tech_elite", label: "Tech-Elite", symbol: "⚙", desc: "Myrmidon, Ursarax" },
    { id: "thrall", label: "Thrall", symbol: "†", desc: "Tech-Thralls, Adsecularis" },
    { id: "ogryn", label: "Ogryn", symbol: "◈", desc: "Ogryn Charonite" },
    { id: "heavy_dread", label: "Heavy Dread", symbol: "⬣", desc: "Telemon, Leviathan" },
    { id: "jetbike", label: "Jetbike", symbol: "»", desc: "Jetbike, Agamatus" },
    { id: "grav_tank", label: "Grav-Tank", symbol: "◇", desc: "Caladius, Pallas" },
  ];

  const getSymbolForType = (typeId) => {
    return DEPLOY_UNIT_TYPES.find(t => t.id === typeId)?.symbol || "╬";
  };

  const handleBoardClick = (e) => {
    // Objective placement mode
    if (placingObjective) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / deployScale;
      const y = (e.clientY - rect.top) / deployScale;
      if (x < 0 || x > BOARD_W || y < 0 || y > BOARD_H) return;
      const snapX = Math.round(x * 2) / 2;
      const snapY = Math.round(y * 2) / 2;
      setObjectiveMarkers(prev => [...prev, { id: Date.now(), x: snapX, y: snapY, value: objValue, label: `Obj ${objCounter}` }]);
      setObjCounter(c => c + 1);
      return;
    }
    // Terrain placement mode
    if (placingTerrain) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / deployScale;
      const y = (e.clientY - rect.top) / deployScale;
      if (x < 0 || x > BOARD_W || y < 0 || y > BOARD_H) return;
      const snapX = Math.round(x * 2) / 2;
      const snapY = Math.round(y * 2) / 2;
      addTerrainPiece(snapX, snapY);
      return;
    }
    // Need either a roster unit or a quick-type selected
    if (!deployBrushUnit && !deploySelectedUnit) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / deployScale;
    const y = (e.clientY - rect.top) / deployScale;
    if (x < 0 || x > BOARD_W || y < 0 || y > BOARD_H) return;
    const snapX = Math.round(x * 2) / 2;
    const snapY = Math.round(y * 2) / 2;

    if (deployBrushUnit) {
      // Place a roster unit
      const iconType = getUnitIconType(deployBrushUnit.name);
      const symbol = getSymbolForType(iconType);
      setDeployedUnits(prev => [...prev, {
        id: Date.now(), type: iconType, x: snapX, y: snapY,
        player: deployPlayer, label: deployBrushUnit.name,
        symbol, name: deployBrushUnit.name,
        unitData: { ...deployBrushUnit, models: deployBrushModels },
        rangedWeapon: deployBrushRangedWeapon,
        meleeWeapon: deployBrushMeleeWeapon,
        sgtEnabled: deployBrushSgtEnabled,
        sgtWeapon: deployBrushSgtWeapon,
        equipment: canTakeEquipment(deployBrushUnit.id) ? { ...deployBrushEquipment } : null,
      }]);
    } else {
      // Quick-place generic type
      const unitType = DEPLOY_UNIT_TYPES.find(u => u.id === deploySelectedUnit);
      setDeployedUnits(prev => [...prev, {
        id: Date.now(), type: deploySelectedUnit, x: snapX, y: snapY,
        player: deployPlayer, label: unitType?.label || deploySelectedUnit,
        symbol: unitType?.symbol || "●", name: "",
      }]);
    }
  };

  const removeDeployedUnit = (id) => {
    setDeployedUnits(prev => prev.filter(u => u.id !== id));
  };

  // ━━ TERRAIN SYSTEM ━━
  const TERRAIN_TYPES = [
    { id: "difficult",   label: "Difficult Terrain",   symbol: "≋", color: "#5a8a3a", bg: "rgba(90,138,58,0.25)",  border: "rgba(90,138,58,0.8)",  desc: "Halves movement. Models in difficult terrain count as moving through terrain." },
    { id: "dangerous",   label: "Dangerous Terrain",   symbol: "⚠", color: "#c07a10", bg: "rgba(192,122,16,0.25)", border: "rgba(192,122,16,0.8)", desc: "Models moving through take an Initiative test or suffer a Wound (no armour)." },
    { id: "impassable",  label: "Impassable Terrain",  symbol: "✖", color: "#8a2020", bg: "rgba(138,32,32,0.30)",  border: "rgba(138,32,32,0.8)",  desc: "No model may move through or be placed in impassable terrain." },
    { id: "cover",       label: "Covered Terrain",     symbol: "⛨", color: "#3a6a8a", bg: "rgba(58,106,138,0.25)", border: "rgba(58,106,138,0.8)", desc: "Models wholly or partially behind gain a 5+ Cover Save (or improve existing by 1)." },
    { id: "fortification", label: "Fortification",     symbol: "▩", color: "#7a6a2a", bg: "rgba(122,106,42,0.35)", border: "rgba(122,106,42,0.9)", desc: "Solid structure. Models inside gain 3+ Cover Save and the Battlements benefit." },
  ];

  const [terrainPieces, setTerrainPieces]         = useState([]);
  const [placingTerrain, setPlacingTerrain]       = useState(false);
  const [selectedTerrainType, setSelectedTerrainType] = useState("difficult");
  const [terrainSize, setTerrainSize]             = useState({ w: 6, h: 4 }); // in inches
  const [terrainCounter, setTerrainCounter]       = useState(1);
  const [terrainSizing, setTerrainSizing]         = useState(false); // toggle between small/medium/large presets

  const TERRAIN_SIZES = [
    { label: "Small (4\"×4\")",    w: 4,  h: 4  },
    { label: "Medium (6\"×6\")",   w: 6,  h: 6  },
    { label: "Large (8\"×6\")",    w: 8,  h: 6  },
    { label: "Huge (12\"×8\")",    w: 12, h: 8  },
    { label: "Tower (3\"×3\")",    w: 3,  h: 3  },
    { label: "Wall (10\"×2\")",    w: 10, h: 2  },
  ];

  const addTerrainPiece = (x, y) => {
    const ttype = TERRAIN_TYPES.find(t => t.id === selectedTerrainType);
    setTerrainPieces(prev => [...prev, {
      id: Date.now(),
      type: selectedTerrainType,
      x: Math.max(0, Math.min(x - terrainSize.w / 2, BOARD_W - terrainSize.w)),
      y: Math.max(0, Math.min(y - terrainSize.h / 2, BOARD_H - terrainSize.h)),
      w: terrainSize.w,
      h: terrainSize.h,
      label: `${ttype.label} ${terrainCounter}`,
      color: ttype.color,
      bg: ttype.bg,
      border: ttype.border,
      symbol: ttype.symbol,
    }]);
    setTerrainCounter(c => c + 1);
  };

  const removeTerrainPiece = (id) => {
    setTerrainPieces(prev => prev.filter(t => t.id !== id));
  };

  // ━━ MOVEMENT PHASE STATE ━━
  const MOVE_VALUES = {
    infantry: 7, assault: 7, breacher: 6, terminator: 5, commander: 7, primarch: 8,
    recon: 7, heavy_support: 6, dreadnought: 8, tank: 10, artillery: 0, flyer: 20,
    transport: 12, custodes: 7, automata: 6, objective: 0,
    daemon: 6, seeker: 7, destroyer: 7, tech_elite: 6, thrall: 6, ogryn: 6,
    heavy_dread: 6, jetbike: 14, grav_tank: 12,
  };
  const [moveSelectedId, setMoveSelectedId] = useState(null);
  const [moveLog, setMoveLog] = useState([]);
  const [movedUnitIds, setMovedUnitIds] = useState(new Set());
  const moveBoardRef = useRef(null);

  const handleMoveMapClick = (e) => {
    if (!moveSelectedId) return;
    const rect = moveBoardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / deployScale;
    const ny = (e.clientY - rect.top) / deployScale;
    if (nx < 0 || nx > BOARD_W || ny < 0 || ny > BOARD_H) return;
    const snapX = Math.round(nx * 2) / 2;
    const snapY = Math.round(ny * 2) / 2;

    const unit = deployedUnits.find(u => u.id === moveSelectedId);
    if (!unit) return;
    const maxMove = MOVE_VALUES[unit.type] || 7;
    const dist = Math.sqrt((snapX - unit.x) ** 2 + (snapY - unit.y) ** 2);
    if (dist > maxMove + 0.5) return; // tolerance for snapping

    const clampDist = Math.min(dist, maxMove);
    const fromX = unit.x, fromY = unit.y;

    setDeployedUnits(prev => prev.map(u => u.id === moveSelectedId ? { ...u, x: snapX, y: snapY } : u));
    setMovedUnitIds(prev => new Set([...prev, moveSelectedId]));
    setMoveLog(prev => [...prev, {
      id: moveSelectedId, label: unit.label, player: unit.player, symbol: unit.symbol,
      fromX, fromY, toX: snapX, toY: snapY,
      distance: Math.round(dist * 10) / 10, maxMove,
    }]);
    setMoveSelectedId(null);
  };

  const undoLastMove = () => {
    if (moveLog.length === 0) return;
    const last = moveLog[moveLog.length - 1];
    setDeployedUnits(prev => prev.map(u => u.id === last.id ? { ...u, x: last.fromX, y: last.fromY } : u));
    setMovedUnitIds(prev => { const s = new Set(prev); s.delete(last.id); return s; });
    setMoveLog(prev => prev.slice(0, -1));
  };

  const resetAllMoves = () => {
    // Undo all moves in reverse order
    const reversed = [...moveLog].reverse();
    let units = [...deployedUnits];
    for (const m of reversed) {
      units = units.map(u => u.id === m.id ? { ...u, x: m.fromX, y: m.fromY } : u);
    }
    setDeployedUnits(units);
    setMovedUnitIds(new Set());
    setMoveLog([]);
  };

  // ━━ SHARED BOARD RENDERER ━━
  const renderBoard = ({ refObj, onClick, cursorMode, showZones, showMoveRange, moveRangeUnit, extraOverlays, unitOnClick, weaponRange, weaponRangeUnit, highlightAttacker, highlightTarget }) => {
    const selectedMoveUnit = moveRangeUnit ? deployedUnits.find(u => u.id === moveRangeUnit) : null;
    const moveMax = selectedMoveUnit ? (MOVE_VALUES[selectedMoveUnit.type] || 7) : 0;
    const weaponUnit = weaponRangeUnit ? deployedUnits.find(u => u.id === weaponRangeUnit) : null;
    return (
      <div style={{ ...panelStyle, marginBottom: 12, padding: 0, overflow: "hidden" }}>
        <div style={{ overflow: "auto", maxHeight: "70vh", background: "#2a2a20" }}>
          <div
            ref={refObj}
            onClick={onClick}
            style={{
              position: "relative",
              width: BOARD_W * deployScale,
              height: BOARD_H * deployScale,
              background: "#3a3a2e",
              cursor: cursorMode || "default",
              margin: "0 auto",
            }}
          >
            {/* 1-inch texture */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.08,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px), repeating-linear-gradient(90deg, transparent, transparent ${deployScale - 1}px, rgba(255,255,255,0.1) ${deployScale}px)`,
              pointerEvents: "none",
            }} />

            {/* Grid lines every 6" */}
            {deployShowGrid && Array.from({ length: Math.floor(BOARD_W / 6) + 1 }, (_, i) => (
              <div key={`gv${i}`} style={{
                position: "absolute", left: i * 6 * deployScale, top: 0,
                width: 1, height: BOARD_H * deployScale,
                background: i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }} />
            ))}
            {deployShowGrid && Array.from({ length: Math.floor(BOARD_H / 6) + 1 }, (_, i) => (
              <div key={`gh${i}`} style={{
                position: "absolute", top: i * 6 * deployScale, left: 0,
                height: 1, width: BOARD_W * deployScale,
                background: i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }} />
            ))}

            {/* Grid labels every 12" */}
            {deployShowGrid && Array.from({ length: Math.floor(BOARD_W / 12) + 1 }, (_, i) => (
              <div key={`lv${i}`} style={{
                position: "absolute", left: i * 12 * deployScale - 6, top: 2,
                fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "'Cinzel', serif", pointerEvents: "none",
              }}>{i * 12}"</div>
            ))}
            {deployShowGrid && Array.from({ length: Math.floor(BOARD_H / 12) + 1 }, (_, i) => (
              <div key={`lh${i}`} style={{
                position: "absolute", top: i * 12 * deployScale - 4, left: 3,
                fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "'Cinzel', serif", pointerEvents: "none",
              }}>{i * 12}"</div>
            ))}

            {/* Deployment zones — mission-specific */}
            {showZones && (() => {
              const mission = MISSIONS[missionType];
              if (!mission) return null;
              const zones = mission.renderZones(deployScale);
              return (
                <>
                  {zones.map((z, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      left: z.left, top: z.top,
                      width: z.width, height: z.height,
                      background: z.color, border: z.border,
                      pointerEvents: "none",
                    }}>
                      <div style={{ position: "absolute", fontSize: 9, fontFamily: "'Cinzel', serif", letterSpacing: 1, ...z.labelStyle }}>
                        {z.label}
                      </div>
                    </div>
                  ))}
                  {/* Search & Destroy exclusion circle (18" diameter = 9" radius from centre) */}
                  {mission.exclusionCircle && (
                    <svg style={{ position: "absolute", inset: 0, width: BOARD_W * deployScale, height: BOARD_H * deployScale, pointerEvents: "none" }}>
                      <circle
                        cx={(BOARD_W / 2) * deployScale} cy={(BOARD_H / 2) * deployScale}
                        r={9 * deployScale}
                        fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} strokeDasharray="6,4"
                      />
                      <text x={(BOARD_W / 2) * deployScale} y={(BOARD_H / 2) * deployScale - 2}
                        textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.18)" fontFamily="'Cinzel', serif">
                        18" EXCLUSION ZONE
                      </text>
                    </svg>
                  )}
                  {/* Centre line */}
                  <div style={{
                    position: "absolute", left: 0, top: (BOARD_H / 2) * deployScale - 0.5,
                    width: BOARD_W * deployScale, height: 1,
                    background: "rgba(255,255,255,0.08)", pointerEvents: "none",
                  }} />
                  {missionType === "hammer" && (
                    <div style={{
                      position: "absolute", left: (BOARD_W / 2) * deployScale - 0.5, top: 0,
                      width: 1, height: BOARD_H * deployScale,
                      background: "rgba(255,255,255,0.08)", pointerEvents: "none",
                    }} />
                  )}
                  <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "'Cinzel', serif", letterSpacing: 4,
                    pointerEvents: "none", whiteSpace: "nowrap",
                  }}>NO MAN'S LAND</div>
                </>
              );
            })()}

            {/* Move range indicator */}
            {showMoveRange && selectedMoveUnit && (
              <div style={{
                position: "absolute",
                left: selectedMoveUnit.x * deployScale - moveMax * deployScale,
                top: selectedMoveUnit.y * deployScale - moveMax * deployScale,
                width: moveMax * 2 * deployScale,
                height: moveMax * 2 * deployScale,
                borderRadius: "50%",
                border: "2px dashed rgba(255,220,80,0.5)",
                background: "rgba(255,220,80,0.06)",
                pointerEvents: "none",
              }} />
            )}

            {/* Move trail lines from log */}
            {moveLog.length > 0 && (
              <svg style={{ position: "absolute", inset: 0, width: BOARD_W * deployScale, height: BOARD_H * deployScale, pointerEvents: "none" }}>
                {moveLog.map((m, i) => (
                  <g key={i}>
                    <line
                      x1={m.fromX * deployScale} y1={m.fromY * deployScale}
                      x2={m.toX * deployScale} y2={m.toY * deployScale}
                      stroke={m.player === "p1" ? "rgba(255,100,100,0.4)" : "rgba(100,160,255,0.4)"}
                      strokeWidth={2} strokeDasharray="4,3"
                    />
                    <circle cx={m.fromX * deployScale} cy={m.fromY * deployScale} r={3}
                      fill={m.player === "p1" ? "rgba(255,100,100,0.3)" : "rgba(100,160,255,0.3)"} />
                  </g>
                ))}
              </svg>
            )}

            {extraOverlays}

            {/* Weapon range circle */}
            {weaponRange > 0 && weaponUnit && (
              <div style={{
                position: "absolute",
                left: weaponUnit.x * deployScale - weaponRange * deployScale,
                top: weaponUnit.y * deployScale - weaponRange * deployScale,
                width: weaponRange * 2 * deployScale,
                height: weaponRange * 2 * deployScale,
                borderRadius: "50%",
                border: "2px dashed rgba(255,140,40,0.5)",
                background: "rgba(255,140,40,0.04)",
                pointerEvents: "none",
              }} />
            )}

            {/* Firing line: attacker to target */}
            {highlightAttacker && highlightTarget && (() => {
              const au = deployedUnits.find(u => u.id === highlightAttacker);
              const tu = deployedUnits.find(u => u.id === highlightTarget);
              if (!au || !tu) return null;
              const dist = Math.round(Math.sqrt((au.x - tu.x) ** 2 + (au.y - tu.y) ** 2) * 10) / 10;
              const inRange = weaponRange > 0 ? dist <= weaponRange : true;
              return (
                <svg style={{ position: "absolute", inset: 0, width: BOARD_W * deployScale, height: BOARD_H * deployScale, pointerEvents: "none" }}>
                  <line
                    x1={au.x * deployScale} y1={au.y * deployScale}
                    x2={tu.x * deployScale} y2={tu.y * deployScale}
                    stroke={inRange ? "rgba(255,200,40,0.6)" : "rgba(255,60,60,0.5)"}
                    strokeWidth={2} strokeDasharray={inRange ? "6,3" : "3,3"}
                  />
                  <text x={(au.x + tu.x) / 2 * deployScale} y={(au.y + tu.y) / 2 * deployScale - 6}
                    fill={inRange ? "rgba(255,220,80,0.8)" : "rgba(255,80,80,0.8)"}
                    fontSize={9} fontFamily="'Cinzel', serif" textAnchor="middle">
                    {dist}" {!inRange ? "(OUT OF RANGE)" : ""}
                  </text>
                </svg>
              );
            })()}

            {/* Terrain Pieces — rendered before units so units appear on top */}
            {terrainPieces.map(terrain => {
              const ttype = TERRAIN_TYPES.find(t => t.id === terrain.type);
              return (
                <div key={terrain.id}
                  onClick={(e) => { e.stopPropagation(); removeTerrainPiece(terrain.id); }}
                  title={`${terrain.label} — ${ttype?.desc || ""} (click to remove)`}
                  style={{
                    position: "absolute",
                    left: terrain.x * deployScale,
                    top: terrain.y * deployScale,
                    width: terrain.w * deployScale,
                    height: terrain.h * deployScale,
                    background: terrain.bg,
                    border: `2px solid ${terrain.border}`,
                    borderRadius: terrain.type === "fortification" ? 3 : 6,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", zIndex: 2,
                    boxShadow: terrain.type === "fortification" ? `inset 0 0 8px rgba(0,0,0,0.3), 0 0 4px ${terrain.border}` : "none",
                  }}>
                  <div style={{ fontSize: Math.max(terrain.w * deployScale * 0.22, 10), color: terrain.color, lineHeight: 1 }}>
                    {terrain.symbol}
                  </div>
                  <div style={{
                    fontSize: Math.max(Math.min(terrain.w * deployScale * 0.09, 9), 6),
                    color: terrain.color, fontFamily: "'Cinzel', serif", fontWeight: 700,
                    letterSpacing: 0.5, textAlign: "center", lineHeight: 1.2, marginTop: 2,
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                  }}>
                    {terrain.w * deployScale > 50 ? terrain.label : ""}
                  </div>
                  <div style={{ fontSize: 7, color: terrain.color, opacity: 0.7, fontFamily: "'Cinzel', serif" }}>
                    {terrain.w * deployScale > 40 ? `${terrain.w}″×${terrain.h}″` : ""}
                  </div>
                </div>
              );
            })}

            {/* Objective Markers */}
            {objectiveMarkers.map(obj => {
              const sz = Math.max(deployScale * 2, 18);
              return (
                <div key={obj.id}
                  onClick={(e) => { e.stopPropagation(); setObjectiveMarkers(prev => prev.filter(o => o.id !== obj.id)); }}
                  title={`${obj.label} — ${obj.value} VP (click to remove)`}
                  style={{
                    position: "absolute",
                    left: obj.x * deployScale - sz / 2,
                    top: obj.y * deployScale - sz / 2,
                    width: sz, height: sz,
                    display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    borderRadius: "50%",
                    background: "rgba(255,215,0,0.9)",
                    border: "2.5px solid #ffd700",
                    boxShadow: "0 0 8px rgba(255,215,0,0.6)",
                    color: "#2a2418", fontSize: Math.max(sz * 0.4, 8), fontWeight: 900,
                    fontFamily: "'Cinzel', serif", cursor: "pointer", zIndex: 5,
                  }}>
                  ⊕
                  <div style={{ fontSize: Math.max(sz * 0.28, 6), lineHeight: 1, color: "#6b4508" }}>{obj.value}VP</div>
                </div>
              );
            })}

            {/* Placed units */}
            {deployedUnits.map(unit => {
              const isP1 = unit.player === "p1";
              const col = isP1 ? "#e05555" : "#5599dd";
              const bgCol = isP1 ? "rgba(200,60,60,0.85)" : "rgba(50,120,200,0.85)";
              const sz = Math.max(deployScale * 1.6, 16);
              const isSelected = unit.id === moveRangeUnit;
              const isAttacker = unit.id === highlightAttacker;
              const isTarget = unit.id === highlightTarget;
              const isRouted = routedUnits.has(unit.id);
              const hasMoved = movedUnitIds.has(unit.id);
              const facing = unitFacings[unit.id];
              return (
                <div key={unit.id}
                  onClick={(e) => { e.stopPropagation(); unitOnClick && unitOnClick(unit, e); }}
                  title={`${unit.label} (${unit.player.toUpperCase()}) — ${unit.x}", ${unit.y}"${isRouted ? " — ROUTED" : ""}${hasMoved ? " (moved)" : ""}`}
                  style={{
                    position: "absolute",
                    left: unit.x * deployScale - sz / 2,
                    top: unit.y * deployScale - sz / 2,
                    width: sz, height: sz,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: unit.type === "tank" || unit.type === "transport" ? 3 : unit.type === "objective" ? "50%" : 4,
                    background: isRouted ? "rgba(100,100,100,0.7)" : unit.type === "objective" ? "rgba(255,215,0,0.85)" : bgCol,
                    border: isAttacker ? "2.5px solid #ffd700" : isTarget ? "2.5px solid #ff4444" : isSelected ? "2px solid #ffd700" : `1.5px solid ${unit.type === "objective" ? "#ffd700" : col}`,
                    color: unit.type === "objective" ? "#2a2418" : "#fff",
                    fontSize: Math.max(sz * 0.55, 10),
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: isAttacker ? "0 0 14px rgba(255,215,0,0.6)" : isTarget ? "0 0 14px rgba(255,60,60,0.6)" : isSelected ? "0 0 12px rgba(255,215,0,0.5)" : hasMoved ? `0 0 6px rgba(${isP1 ? "255,100,100" : "100,160,255"},0.4)` : "0 1px 4px rgba(0,0,0,0.4)",
                    transition: "all 0.15s ease",
                    zIndex: isAttacker || isTarget ? 25 : isSelected ? 20 : 10,
                    lineHeight: 1,
                    opacity: isRouted ? 0.5 : (hasMoved && !isSelected) ? 0.7 : 1,
                  }}
                >
                  {unit.symbol}
                  {/* Facing indicator */}
                  {facing !== undefined && (
                    <div style={{
                      position: "absolute",
                      left: sz / 2 + Math.cos(facing * Math.PI / 180) * (sz / 2 + 4) - 3,
                      top: sz / 2 + Math.sin(facing * Math.PI / 180) * (sz / 2 + 4) - 3,
                      width: 6, height: 6, borderRadius: "50%",
                      background: isRouted ? "#888" : (isP1 ? "#ff8888" : "#88bbff"),
                      border: "1px solid rgba(255,255,255,0.5)",
                      pointerEvents: "none",
                    }} />
                  )}
                  {/* Routed indicator */}
                  {isRouted && (
                    <div style={{
                      position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                      fontSize: 8, color: "#ff6666", fontFamily: "'Cinzel', serif", fontWeight: 700,
                      pointerEvents: "none", whiteSpace: "nowrap",
                    }}>ROUTED</div>
                  )}
                </div>
              );
            })}

            {/* Board border */}
            <div style={{
              position: "absolute", inset: 0,
              border: "2px solid rgba(255,255,255,0.2)", borderRadius: 2,
              pointerEvents: "none",
            }} />
          </div>
        </div>
      </div>
    );
  };

  // Melee weapons for assault phase
  const aMeleeWeapons = useMemo(() => aUnit ? (MELEE_WEAPON_PROFILES[aUnit.id] || []) : [], [aUnit]);
  const dMeleeWeapons = useMemo(() => dUnit ? (MELEE_WEAPON_PROFILES[dUnit.id] || []) : [], [dUnit]);

  const meleeUnitRoster = useMemo(() => {
    return UNIT_PRESETS.map(cat => ({
      ...cat,
      units: cat.units.filter(u => MELEE_WEAPON_PROFILES[u.id]?.length > 0)
    })).filter(cat => cat.units.length > 0);
  }, []);

  const applyAssaultUnit = useCallback((unit, side) => {
    const meleeWeapons = MELEE_WEAPON_PROFILES[unit.id] || [];
    const w0 = meleeWeapons[0];
    if (side === "attacker") {
      setAUnit(unit); setAShowPresets(false); setAModels(unit.models);
      if (w0) { setASelectedMelee(w0); setAWS(w0.ws); setAS(w0.s); setAAP(w0.ap); setAI(w0.i); setAA(w0.a); setAW(w0.w); setAT(w0.t); setASv(w0.sv); setAInv(w0.inv); setAFnp(w0.fnp); setARules(w0.rules || {}); }
    } else {
      setDUnit(unit); setDShowPresets(false); setDModels(unit.models);
      if (w0) { setDSelectedMelee(w0); setDWS(w0.ws); setDS(w0.s); setDAP(w0.ap); setDI(w0.i); setDA(w0.a); setDW(w0.w); setDT(w0.t); setDSv(w0.sv); setDInv(w0.inv); setDFnp(w0.fnp); setDRules(w0.rules || {}); }
    }
  }, []);

  const applyAssaultMelee = useCallback((w, side) => {
    if (side === "attacker") {
      setASelectedMelee(w); setAWS(w.ws); setAS(w.s); setAAP(w.ap); setAI(w.i); setAA(w.a); setAW(w.w); setAT(w.t); setASv(w.sv); setAInv(w.inv); setAFnp(w.fnp); setARules(w.rules || {});
    } else {
      setDSelectedMelee(w); setDWS(w.ws); setDS(w.s); setDAP(w.ap); setDI(w.i); setDA(w.a); setDW(w.w); setDT(w.t); setDSv(w.sv); setDInv(w.inv); setDFnp(w.fnp); setDRules(w.rules || {});
    }
  }, []);

  const handleAssaultResolve = () => {
    const res = resolveAssaultPhase({
      attackerModels: aModels, attackerWS: aWS, attackerS: aS, attackerAP: aAP,
      attackerI: aI, attackerA: aA, attackerW: aW, attackerSv: aSv, attackerInv: aInv,
      attackerFnp: aFnp, attackerT: aT, attackerRules: aRules,
      defenderModels: dModels, defenderWS: dWS, defenderS: dS, defenderAP: dAP,
      defenderI: dI, defenderA: dA, defenderW: dW, defenderSv: dSv, defenderInv: dInv,
      defenderFnp: dFnp, defenderT: dT, defenderRules: dRules,
      isCharging: assaultCharging, disordered: assaultDisordered,
    });
    setAssaultResult(res);
    // Track kills
    const atkName = aUnit?.name || "Attacker";
    const defName = dUnit?.name || "Defender";
    const kills = [];
    if (res.defenderCasualties > 0) {
      kills.push({ phase: "Assault", attacker: atkName, target: defName, casualties: res.defenderCasualties, detail: `${atkName} → ${defName}: ${res.defenderCasualties} killed` });
    }
    if (res.attackerCasualties > 0) {
      kills.push({ phase: "Assault", attacker: defName, target: atkName, casualties: res.attackerCasualties, detail: `${defName} → ${atkName}: ${res.attackerCasualties} killed` });
    }
    if (kills.length > 0) setRoundKills(prev => [...prev, ...kills]);
  };

  // Attacker
  const [numModels, setNumModels] = useState(10);
  const [numShots, setNumShots] = useState(1);
  const [bs, setBs] = useState(4);
  const [strength, setStrength] = useState(4);
  const [ap, setAp] = useState("5");
  const [weaponType, setWeaponType] = useState("Rapid Fire");
  const [halfRange, setHalfRange] = useState(false);
  const [moved, setMoved] = useState(false);
  const [indirect, setIndirect] = useState(false);

  // Defender
  const [toughness, setToughness] = useState(4);
  const [armourSave, setArmourSave] = useState("3");
  const [invulnSave, setInvulnSave] = useState("-");
  const [coverSave, setCoverSave] = useState("-");
  const [fnp, setFnp] = useState("-");
  const [leadership, setLeadership] = useState(8);
  const [targetModels, setTargetModels] = useState(10);

  // Special Rules
  const [activeRules, setActiveRules] = useState({});

  // Sergeant
  const [sgtEnabled, setSgtEnabled] = useState(false);
  const [sgtWeapon, setSgtWeapon] = useState(null);

  // Target Equipment (applied from map selection or manual toggle)
  const [targetHasVexilla, setTargetHasVexilla] = useState(false);
  const [targetHasNoxVox, setTargetHasNoxVox] = useState(false);

  // Presets — unit and weapon are now separate
  const [showAttackerPresets, setShowAttackerPresets] = useState(false);
  const [showTargetPresets, setShowTargetPresets] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null); // { id, name, models, bs }
  const [selectedWeapon, setSelectedWeapon] = useState(null); // weapon profile object
  const [targetPresetName, setTargetPresetName] = useState(null);

  // Derived: available weapons for selected unit
  const availableWeapons = useMemo(() => {
    if (!selectedUnit) return [];
    return WEAPON_PROFILES[selectedUnit.id] || [];
  }, [selectedUnit]);

  // Derived: available sergeant weapons
  const availableSgtWeapons = useMemo(() => {
    if (!selectedUnit || !selectedUnit.hasSgt) return [];
    const cat = getSgtCategory(selectedUnit.id);
    return cat ? (SERGEANT_WEAPONS[cat] || []) : [];
  }, [selectedUnit]);

  const applyUnitPreset = useCallback((unit) => {
    setSelectedUnit(unit);
    setNumModels(unit.models);
    setBs(unit.bs);
    setShowAttackerPresets(false);
    // Reset sergeant
    if (unit.hasSgt) {
      setSgtEnabled(false);
      const cat = getSgtCategory(unit.id);
      const sgtWeapons = cat ? (SERGEANT_WEAPONS[cat] || []) : [];
      setSgtWeapon(sgtWeapons.length > 0 ? sgtWeapons[0] : null);
    } else {
      setSgtEnabled(false);
      setSgtWeapon(null);
    }
    // Auto-select first weapon if unit changes
    const weapons = WEAPON_PROFILES[unit.id] || [];
    if (weapons.length > 0) {
      const w = weapons[0];
      setSelectedWeapon(w);
      setNumShots(w.shots);
      setStrength(w.s);
      setAp(w.ap);
      setWeaponType(w.type);
      setActiveRules(w.rules || {});
      if (w.defaultModels) setNumModels(w.defaultModels);
    } else {
      setSelectedWeapon(null);
    }
  }, []);

  const applyWeaponPreset = useCallback((weapon) => {
    setSelectedWeapon(weapon);
    setNumShots(weapon.shots);
    setStrength(weapon.s);
    setAp(weapon.ap);
    setWeaponType(weapon.type);
    setActiveRules(weapon.rules || {});
    // Reset models to unit default, unless weapon overrides
    if (weapon.defaultModels) {
      setNumModels(weapon.defaultModels);
    } else if (selectedUnit) {
      setNumModels(selectedUnit.models);
    }
  }, [selectedUnit]);

  const applyTargetPreset = useCallback((preset) => {
    setToughness(preset.t);
    setArmourSave(preset.sv);
    setInvulnSave(preset.inv);
    setCoverSave(preset.cover || "-");
    setFnp(preset.fnp);
    setLeadership(preset.ld || 8);
    setTargetModels(preset.models || preset.unitSize || 10);
    setTargetPresetName(preset.name);
    setShowTargetPresets(false);
  }, []);

  // Results
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Charge Phase
  const [showCharge, setShowCharge] = useState(false);
  const [chargeDistance, setChargeDistance] = useState(8);
  const [chargeTerrain, setChargeTerrain] = useState(false);
  const [chargeDisordered, setChargeDisordered] = useState(false);
  const [doOverwatch, setDoOverwatch] = useState(true);
  const [overwatchShots, setOverwatchShots] = useState(1);
  const [overwatchS, setOverwatchS] = useState(4);
  const [overwatchAP, setOverwatchAP] = useState("5");
  // Volley Fire (charger fires Assault weapons at snap shot before charging)
  const [doVolleyFire, setDoVolleyFire] = useState(false);
  const [volleyFireShots, setVolleyFireShots] = useState(1);
  const [volleyFireS, setVolleyFireS] = useState(4);
  const [volleyFireAP, setVolleyFireAP] = useState("5");
  const [selectedVolleyWeapon, setSelectedVolleyWeapon] = useState(null);
  // Return Fire (defender reaction — fires ranged weapons at snap shot)
  const [doReturnFire, setDoReturnFire] = useState(false);
  const [returnFireShots, setReturnFireShots] = useState(1);
  const [returnFireS, setReturnFireS] = useState(4);
  const [returnFireAP, setReturnFireAP] = useState("5");
  const [selectedReturnWeapon, setSelectedReturnWeapon] = useState(null);
  // Charger melee stats
  const [chargerWS, setChargerWS] = useState(4);
  const [chargerS_melee, setChargerS_melee] = useState(4);
  const [chargerAP_melee, setChargerAP_melee] = useState("-");
  const [chargerI, setChargerI] = useState(4);
  const [chargerA, setChargerA] = useState(1);
  const [chargerW_melee, setChargerW_melee] = useState(1);
  // Charger saves (for overwatch)
  const [chargerSv, setChargerSv] = useState("3");
  const [chargerInvSv, setChargerInvSv] = useState("-");
  const [chargerFnpSv, setChargerFnpSv] = useState("-");
  const [chargerT_melee, setChargerT_melee] = useState(4);
  // Defender melee stats
  const [defenderWS, setDefenderWS] = useState(4);
  const [defenderS_melee, setDefenderS_melee] = useState(4);
  const [defenderAP_melee, setDefenderAP_melee] = useState("-");
  const [defenderI, setDefenderI] = useState(4);
  const [defenderA, setDefenderA] = useState(1);
  const [defenderW_melee, setDefenderW_melee] = useState(1);
  // Melee special rules
  const [chargerMeleeRules, setChargerMeleeRules] = useState({});
  const [defenderMeleeRules, setDefenderMeleeRules] = useState({});
  // Selected melee weapons
  const [selectedChargerMelee, setSelectedChargerMelee] = useState(null);
  const [selectedDefenderMelee, setSelectedDefenderMelee] = useState(null);
  // Charge result
  const [chargeResult, setChargeResult] = useState(null);

  // Available melee weapons based on selected units
  const chargerMeleeWeapons = useMemo(() => {
    if (!selectedUnit) return [];
    return MELEE_WEAPON_PROFILES[selectedUnit.id] || [];
  }, [selectedUnit]);

  // Assault weapons available for Volley Fire (charger fires before charging)
  const chargerAssaultWeapons = useMemo(() => {
    if (!selectedUnit) return [];
    const weapons = WEAPON_PROFILES[selectedUnit.id] || [];
    return weapons.filter(w => w.type === "Assault" || w.type === "Pistol");
  }, [selectedUnit]);

  const applyVolleyWeapon = useCallback((weapon) => {
    setSelectedVolleyWeapon(weapon);
    setVolleyFireShots(weapon.shots);
    setVolleyFireS(weapon.s);
    setVolleyFireAP(weapon.ap);
  }, []);

  // Defender's ranged weapons for Return Fire reaction
  const defenderRangedWeapons = useMemo(() => {
    if (!targetPresetName) return [];
    for (const cat of UNIT_PRESETS) {
      const found = cat.units.find(u => u.name === targetPresetName);
      if (found && found.id) return WEAPON_PROFILES[found.id] || [];
    }
    return [];
  }, [targetPresetName]);

  const applyReturnWeapon = useCallback((weapon) => {
    setSelectedReturnWeapon(weapon);
    setReturnFireShots(weapon.shots);
    setReturnFireS(weapon.s);
    setReturnFireAP(weapon.ap);
  }, []);

  const defenderMeleeWeapons = useMemo(() => {
    if (!targetPresetName) return [];
    // Find the target unit's id from UNIT_PRESETS
    for (const cat of UNIT_PRESETS) {
      const found = cat.units.find(u => u.name === targetPresetName);
      if (found && found.id) return MELEE_WEAPON_PROFILES[found.id] || [];
    }
    return [];
  }, [targetPresetName]);

  const applyChargerMelee = useCallback((weapon) => {
    setSelectedChargerMelee(weapon);
    setChargerWS(weapon.ws);
    setChargerS_melee(weapon.s);
    setChargerAP_melee(weapon.ap);
    setChargerI(weapon.i);
    setChargerA(weapon.a);
    setChargerW_melee(weapon.w);
    setChargerT_melee(weapon.t);
    setChargerSv(weapon.sv);
    setChargerInvSv(weapon.inv);
    setChargerFnpSv(weapon.fnp || "-");
    setChargerMeleeRules(weapon.rules || {});
  }, []);

  const applyDefenderMelee = useCallback((weapon) => {
    setSelectedDefenderMelee(weapon);
    setDefenderWS(weapon.ws);
    setDefenderS_melee(weapon.s);
    setDefenderAP_melee(weapon.ap);
    setDefenderI(weapon.i);
    setDefenderA(weapon.a);
    setDefenderW_melee(weapon.w);
    setDefenderMeleeRules(weapon.rules || {});
  }, []);

  const toggleRule = useCallback((id) => {
    setActiveRules(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const saveOptions = [
    { value: "-", label: "None" },
    { value: "2", label: "2+" }, { value: "3", label: "3+" },
    { value: "4", label: "4+" }, { value: "5", label: "5+" },
    { value: "6", label: "6+" }
  ];

  const apOptions = [
    { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" },
    { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" },
    { value: "-", label: "—" }
  ];

  const params = useMemo(() => ({
    numModels, numShots, bs, strength, ap, toughness,
    armourSave, invulnSave, coverSave, fnp,
    specialRules: activeRules, halfRange, moved, indirect, weaponType,
    leadership, targetModels,
    sgtEnabled, sgtWeapon,
    hasVexilla: targetHasVexilla, hasNoxVox: targetHasNoxVox
  }), [numModels, numShots, bs, strength, ap, toughness, armourSave, invulnSave, coverSave, fnp, activeRules, halfRange, moved, indirect, weaponType, leadership, targetModels, sgtEnabled, sgtWeapon, targetHasVexilla, targetHasNoxVox]);

  const expected = useMemo(() => calculateExpected(params), [params]);

  const handleResolve = () => {
    const res = resolveShootingPhase(params);
    setResult(res);
    setHistory(prev => [{ ...res, timestamp: Date.now() }, ...prev].slice(0, 20));
    setChargeResult(null); // Reset charge when re-resolving shooting
    setReturnFireResult(null); // Reset return fire
    // Track kills
    if (res.casualties > 0) {
      const atkName = selectedUnit?.name || "Shooting Unit";
      const tgtName = targetPresetName || "Target Unit";
      setRoundKills(prev => [...prev, {
        phase: "Shooting", attacker: atkName, target: tgtName,
        casualties: res.casualties, detail: `${atkName} → ${tgtName}: ${res.casualties} killed`,
      }]);
    }
  };

  // Return Fire state
  const [returnFireResult, setReturnFireResult] = useState(null);

  const handleReturnFire = () => {
    // Use attacker's defensive stats from the selected unit
    const attackerUnit = selectedUnit || {};
    const res = resolveReturnFire({
      defenderModels: targetModels,
      returnFireShots, returnFireS, returnFireAP,
      attackerT: attackerUnit.t || toughness || 4,
      attackerSv: attackerUnit.sv || "3",
      attackerInv: attackerUnit.inv || "-",
      attackerFnp: attackerUnit.fnp || "-",
      attackerW: attackerUnit.w || 1,
    });
    setReturnFireResult(res);
  };

  const handleChargeResolve = () => {
    const chargeParams = {
      chargeDistance,
      chargingModels: numModels,
      chargerWS, chargerS: chargerS_melee, chargerAP: chargerAP_melee,
      chargerI, chargerA, chargerW: chargerW_melee,
      defenderWS, defenderT: toughness,
      defenderSv: armourSave, defenderInv: invulnSave, defenderFnp: fnp,
      defenderModels: targetModels, defenderS: defenderS_melee,
      defenderAP: defenderAP_melee, defenderA, defenderI,
      defenderW: defenderW_melee,
      chargerRules: chargerMeleeRules,
      defenderRules: defenderMeleeRules,
      terrain: chargeTerrain,
      disordered: chargeDisordered,
      doOverwatch,
      overwatchShots, overwatchS, overwatchAP,
      overwatchRules: {},
      chargerSv, chargerInv: chargerInvSv, chargerFnp: chargerFnpSv,
      chargerT: chargerT_melee,
      // Volley Fire
      doVolleyFire,
      volleyFireShots, volleyFireS, volleyFireAP,
      defenderW_target: defenderW_melee,
    };
    const res = resolveChargePhase(chargeParams);
    setChargeResult(res);
    // Track kills
    const chgAtkName = selectedUnit?.name || "Charging Unit";
    const chgDefName = targetPresetName || "Target Unit";
    const chargeKills = [];
    if (res.overwatchCasualties > 0) {
      chargeKills.push({ phase: "Charge", attacker: chgDefName, target: chgAtkName, casualties: res.overwatchCasualties, detail: `Overwatch: ${chgDefName} → ${chgAtkName}: ${res.overwatchCasualties} killed` });
    }
    if ((res.volleyCasualties || 0) > 0) {
      chargeKills.push({ phase: "Charge", attacker: chgAtkName, target: chgDefName, casualties: res.volleyCasualties, detail: `Volley Fire: ${chgAtkName} → ${chgDefName}: ${res.volleyCasualties} killed` });
    }
    if (res.meleeDefenderCasualties > 0) {
      chargeKills.push({ phase: "Charge", attacker: chgAtkName, target: chgDefName, casualties: res.meleeDefenderCasualties, detail: `Charge Melee: ${chgAtkName} → ${chgDefName}: ${res.meleeDefenderCasualties} killed` });
    }
    if (res.meleeAttackerCasualties > 0) {
      chargeKills.push({ phase: "Charge", attacker: chgDefName, target: chgAtkName, casualties: res.meleeAttackerCasualties, detail: `Charge Melee: ${chgDefName} → ${chgAtkName}: ${res.meleeAttackerCasualties} killed` });
    }
    if (chargeKills.length > 0) setRoundKills(prev => [...prev, ...chargeKills]);
    // Move charger on map if charge succeeded
    applyChargeMovement(res);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f4efe6",
      backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(184,134,11,0.06) 0%, transparent 60%)",
      color: "#2a2418", fontFamily: "'EB Garamond', 'Georgia', serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        select:focus, input:focus { outline: 1px solid #b8860b; }
        button:hover { filter: brightness(1.1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGold { 0%, 100% { box-shadow: 0 0 8px rgba(184,134,11,0.2); } 50% { box-shadow: 0 0 20px rgba(184,134,11,0.4); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #ece7de; }
        ::-webkit-scrollbar-thumb { background: #c0b498; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #d0c4aa", padding: "20px 24px",
        background: "linear-gradient(180deg, rgba(184,134,11,0.08) 0%, transparent 100%)"
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28, color: "#b8860b" }}>⚔</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#8b6508", letterSpacing: 2 }}>
                COMBAT PHASE RESOLVER
              </h1>
              <div style={{ fontSize: 12, color: "#8a7e6e", fontFamily: "'Cinzel', serif", letterSpacing: 3 }}>
                THE HORUS HERESY · AGE OF DARKNESS · 3RD EDITION · v1.23
              </div>
            </div>
          </div>
          {/* Phase Selector Tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 14 }}>
            {[
              { id: "deployment", label: "📍 DEPLOY", color: "#5b4a8a" },
              { id: "movement", label: "🚶 MOVEMENT", color: "#6b5b2e" },
              { id: "shooting", label: "⚔ SHOOTING", color: "#b8860b" },
              { id: "assault", label: "🗡 ASSAULT", color: "#9b2d2d" },
              { id: "end", label: "🏛 END", color: "#2e5e3e" },
            ].map(phase => {
              const active = activePhase === phase.id;
              return (
                <button key={phase.id} onClick={() => setActivePhase(phase.id)} style={{
                  flex: 1, padding: "10px 16px", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 700,
                  letterSpacing: 2, cursor: "pointer", border: "none", borderBottom: active ? `3px solid ${phase.color}` : "3px solid transparent",
                  background: active ? "rgba(255,255,255,0.6)" : "transparent",
                  color: active ? phase.color : "#8a7e6e",
                  transition: "all 0.2s ease",
                }}>
                  {phase.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px" }}>

        {/* ━━━━━━━━━━━ DEPLOYMENT PHASE ━━━━━━━━━━━ */}
        {activePhase === "deployment" && (<>
          {/* Controls Bar */}
          <div style={{ ...panelStyle, marginBottom: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "#5b4a8a", letterSpacing: 2 }}>DEPLOYMENT — 6' × 4' TABLE</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>Zoom:</span>
                {[6, 8, 10, 12, 14].map(z => (
                  <button key={z} onClick={() => setDeployScale(z)} style={{
                    padding: "3px 7px", borderRadius: 3, fontSize: 9, cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontWeight: deployScale === z ? 700 : 400,
                    background: deployScale === z ? "rgba(91,74,138,0.12)" : "#f0ebe2",
                    border: `1px solid ${deployScale === z ? "#5b4a8a" : "#d0c4aa"}`,
                    color: deployScale === z ? "#5b4a8a" : "#8a7e6e",
                  }}>{z}px</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
              <CheckToggle checked={deployShowGrid} label="Grid Lines" onChange={setDeployShowGrid} />
              <CheckToggle checked={deployShowZones} label="Deploy Zones" onChange={setDeployShowZones} />
            </div>

            {/* Mission Type Selector */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #e8e0d0" }}>
              <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 2, marginBottom: 6 }}>MISSION TYPE</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.values(MISSIONS).map(m => {
                  const active = missionType === m.id;
                  return (
                    <button key={m.id} onClick={() => setMissionType(m.id)} style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: 10, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400, letterSpacing: 1,
                      background: active ? "rgba(91,74,138,0.15)" : "#f8f4ec",
                      border: `1.5px solid ${active ? "#5b4a8a" : "#d0c4aa"}`,
                      color: active ? "#5b4a8a" : "#6a5e4e",
                    }}>
                      {m.name}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "#6a5e4e", fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>
                {MISSIONS[missionType]?.desc}
              </div>
            </div>

            {/* Objective Marker Placement */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #e8e0d0" }}>
              <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 2, marginBottom: 6 }}>OBJECTIVE MARKERS</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>VP VALUE:</span>
                  {[2, 3].map(v => (
                    <button key={v} onClick={() => setObjValue(v)} style={{
                      padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontWeight: objValue === v ? 700 : 400,
                      background: objValue === v ? "rgba(184,134,11,0.15)" : "#f0ebe2",
                      border: `1.5px solid ${objValue === v ? "#b8860b" : "#d0c4aa"}`,
                      color: objValue === v ? "#b8860b" : "#6a5e4e",
                    }}>{v} VP</button>
                  ))}
                </div>
                <button onClick={() => setPlacingObjective(!placingObjective)} style={{
                  padding: "5px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                  fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 1,
                  background: placingObjective ? "rgba(184,134,11,0.2)" : "rgba(184,134,11,0.08)",
                  border: `1.5px solid ${placingObjective ? "#b8860b" : "#d0c4aa"}`,
                  color: placingObjective ? "#b8860b" : "#6a5e4e",
                  animation: placingObjective ? "pulseGold 1.5s ease-in-out infinite" : "none",
                }}>
                  {placingObjective ? "⊕ CLICK MAP TO PLACE..." : "⊕ PLACE OBJECTIVE"}
                </button>
                {objectiveMarkers.length > 0 && (
                  <>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {objectiveMarkers.map(o => (
                        <span key={o.id} style={{
                          fontSize: 9, fontFamily: "'Cinzel', serif", padding: "3px 7px",
                          borderRadius: 3, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(184,134,11,0.3)",
                          color: "#8b6508",
                        }}>
                          {o.label} ({o.value}VP)
                          <button onClick={() => setObjectiveMarkers(prev => prev.filter(x => x.id !== o.id))} style={{
                            marginLeft: 4, background: "none", border: "none", color: "#c74040", cursor: "pointer", fontSize: 9, padding: 0,
                          }}>✕</button>
                        </span>
                      ))}
                    </div>
                    <button onClick={() => { setObjectiveMarkers([]); setObjCounter(1); }} style={{
                      padding: "3px 10px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", background: "rgba(200,50,50,0.08)",
                      border: "1px solid #c74040", color: "#c74040",
                    }}>CLEAR ALL ✕</button>
                  </>
                )}
              </div>
              {placingObjective && (
                <div style={{ marginTop: 4, fontSize: 10, fontFamily: "'EB Garamond', serif", color: "#b8860b", fontStyle: "italic" }}>
                  Click anywhere on the map to place a {objValue}VP objective. Click on an existing marker to remove it. Press "Place Objective" again to cancel.
                </div>
              )}
            </div>

            {/* ── TERRAIN PLACEMENT ── */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #e8e0d0" }}>
              <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#4a7a3a", letterSpacing: 2, marginBottom: 6 }}>TERRAIN</div>

              {/* Terrain type selector */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                {TERRAIN_TYPES.map(tt => {
                  const active = selectedTerrainType === tt.id;
                  return (
                    <button key={tt.id}
                      onClick={() => { setSelectedTerrainType(tt.id); }}
                      title={tt.desc}
                      style={{
                        padding: "5px 10px", borderRadius: 5, fontSize: 9, cursor: "pointer",
                        fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400, letterSpacing: 0.5,
                        background: active ? tt.bg : "#f4f0e8",
                        border: `2px solid ${active ? tt.border : "#d0c4aa"}`,
                        color: active ? tt.color : "#6a5e4e",
                        display: "flex", alignItems: "center", gap: 4,
                        boxShadow: active ? `0 0 6px ${tt.bg}` : "none",
                      }}>
                      <span style={{ fontSize: 12 }}>{tt.symbol}</span>
                      {tt.label}
                    </button>
                  );
                })}
              </div>

              {/* Size selector */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#6a5e4e" }}>SIZE:</span>
                {TERRAIN_SIZES.map(sz => {
                  const isActive = terrainSize.w === sz.w && terrainSize.h === sz.h;
                  return (
                    <button key={sz.label} onClick={() => setTerrainSize({ w: sz.w, h: sz.h })} style={{
                      padding: "3px 8px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontWeight: isActive ? 700 : 400,
                      background: isActive ? "rgba(74,122,58,0.15)" : "#f0ebe2",
                      border: `1.5px solid ${isActive ? "#4a7a3a" : "#d0c4aa"}`,
                      color: isActive ? "#4a7a3a" : "#6a5e4e",
                    }}>{sz.label}</button>
                  );
                })}
              </div>

              {/* Place terrain button + placed list */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => { setPlacingTerrain(!placingTerrain); setPlacingObjective(false); }}
                  style={{
                    padding: "5px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 1,
                    background: placingTerrain ? "rgba(74,122,58,0.2)" : "rgba(74,122,58,0.08)",
                    border: `1.5px solid ${placingTerrain ? "#4a7a3a" : "#d0c4aa"}`,
                    color: placingTerrain ? "#4a7a3a" : "#6a5e4e",
                    animation: placingTerrain ? "pulseGold 1.5s ease-in-out infinite" : "none",
                  }}>
                  {placingTerrain
                    ? `${TERRAIN_TYPES.find(t=>t.id===selectedTerrainType)?.symbol} CLICK MAP TO PLACE...`
                    : `${TERRAIN_TYPES.find(t=>t.id===selectedTerrainType)?.symbol} PLACE TERRAIN`}
                </button>

                {terrainPieces.length > 0 && (
                  <>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {terrainPieces.map(tp => {
                        const ttype = TERRAIN_TYPES.find(t => t.id === tp.type);
                        return (
                          <span key={tp.id} style={{
                            fontSize: 9, fontFamily: "'Cinzel', serif", padding: "3px 7px",
                            borderRadius: 3, background: tp.bg, border: `1px solid ${tp.border}`,
                            color: tp.color, display: "flex", alignItems: "center", gap: 3,
                          }}>
                            {ttype?.symbol} {tp.label} ({tp.w}″×{tp.h}″)
                            <button onClick={() => removeTerrainPiece(tp.id)} style={{
                              background: "none", border: "none", color: "#c74040", cursor: "pointer", fontSize: 9, padding: 0,
                            }}>✕</button>
                          </span>
                        );
                      })}
                    </div>
                    <button onClick={() => { setTerrainPieces([]); setTerrainCounter(1); }} style={{
                      padding: "3px 10px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", background: "rgba(200,50,50,0.08)",
                      border: "1px solid #c74040", color: "#c74040",
                    }}>CLEAR ALL ✕</button>
                  </>
                )}
              </div>

              {placingTerrain && (
                <div style={{ marginTop: 4, fontSize: 10, fontFamily: "'EB Garamond', serif", color: "#4a7a3a", fontStyle: "italic" }}>
                  Placing: <strong>{TERRAIN_TYPES.find(t=>t.id===selectedTerrainType)?.label}</strong> ({terrainSize.w}″×{terrainSize.h}″) — click on the map. Click a placed terrain piece to remove it. Press the button again to cancel.
                </div>
              )}
              {!placingTerrain && (
                <div style={{ marginTop: 4, fontSize: 10, fontFamily: "'EB Garamond', serif", color: "#8a7e6e", fontStyle: "italic" }}>
                  {TERRAIN_TYPES.find(t=>t.id===selectedTerrainType)?.desc}
                </div>
              )}
            </div>
          </div>

          {/* Player Select + Unit Palette */}
          <div style={{ ...panelStyle, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1 }}>PLACING FOR:</span>
              {[
                { id: "p1", label: "PLAYER 1", col: "#9b2d2d" },
                { id: "p2", label: "PLAYER 2", col: "#2a6fb4" },
              ].map(p => (
                <button key={p.id} onClick={() => setDeployPlayer(p.id)} style={{
                  padding: "5px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                  fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 1,
                  background: deployPlayer === p.id ? (p.id === "p1" ? "rgba(155,45,45,0.12)" : "rgba(42,111,180,0.12)") : "#f0ebe2",
                  border: `1.5px solid ${deployPlayer === p.id ? p.col : "#d0c4aa"}`,
                  color: deployPlayer === p.id ? p.col : "#8a7e6e",
                }}>{p.label}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button onClick={() => setDeployedUnits([])} style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: "rgba(200,50,50,0.08)", border: "1.5px solid #c74040", color: "#c74040",
              }}>
                CLEAR ALL ✕
              </button>
            </div>

            {/* Unit Selector — pick from full HH roster */}
            <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 6 }}>SELECT UNIT FROM ROSTER OR QUICK-PLACE BY TYPE</div>

            {/* Selected unit display / Open roster button */}
            <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginBottom: 10 }}>
              <button onClick={() => setDeployModalOpen(true)} style={{
                flex: 1, padding: "10px 14px", borderRadius: 6, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                background: deployBrushUnit ? `rgba(${deployPlayer === "p1" ? "155,45,45" : "42,111,180"},0.06)` : "#f8f4ec",
                border: `2px dashed ${deployBrushUnit ? (deployPlayer === "p1" ? "#9b2d2d" : "#2a6fb4") : "#c0b498"}`,
                transition: "all 0.15s ease",
              }}>
                {deployBrushUnit ? (
                  <>
                    <div style={{
                      width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 4, fontSize: 18,
                      background: deployPlayer === "p1" ? "rgba(200,60,60,0.85)" : "rgba(50,120,200,0.85)",
                      color: "#fff",
                    }}>
                      {DEPLOY_UNIT_TYPES.find(t => t.id === getUnitIconType(deployBrushUnit.name))?.symbol || "╬"}
                    </div>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: "#2a2418" }}>{deployBrushUnit.name}</div>
                      <div style={{ fontSize: 9, color: "#8a7e6e", fontFamily: "'EB Garamond', serif" }}>
                        T{deployBrushUnit.t} · W{deployBrushUnit.w} · Sv{deployBrushUnit.sv}{deployBrushUnit.inv && deployBrushUnit.inv !== "-" ? ` · Inv${deployBrushUnit.inv}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>Models:</span>
                      <button onClick={(e) => { e.stopPropagation(); setDeployBrushModels(prev => Math.max(1, prev - 1)); }} style={{
                        width: 22, height: 22, borderRadius: 3, border: "1px solid #d0c4aa", background: "#f0ebe2",
                        cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#5b4a8a", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>−</button>
                      <input type="number" value={deployBrushModels} min={1} max={40}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setDeployBrushModels(Math.max(1, Math.min(40, parseInt(e.target.value) || 1)))}
                        style={{
                          width: 38, textAlign: "center", padding: "2px 0", borderRadius: 4,
                          border: "1.5px solid #5b4a8a", fontSize: 13, fontFamily: "'Cinzel', serif",
                          fontWeight: 700, color: "#5b4a8a", background: "rgba(91,74,138,0.06)",
                        }}
                      />
                      <button onClick={(e) => { e.stopPropagation(); setDeployBrushModels(prev => Math.min(40, prev + 1)); }} style={{
                        width: 22, height: 22, borderRadius: 3, border: "1px solid #d0c4aa", background: "#f0ebe2",
                        cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#5b4a8a", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>+</button>
                    </div>
                    <div style={{ marginLeft: 4, fontFamily: "'Cinzel', serif", fontSize: 9, color: "#5b4a8a", letterSpacing: 1 }}>CHANGE ▸</div>
                  </>
                ) : (
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 11, color: "#5b4a8a", letterSpacing: 1 }}>📋 OPEN UNIT ROSTER</div>
                    <div style={{ fontSize: 9, color: "#a09888", fontFamily: "'EB Garamond', serif" }}>Choose from all HH 3rd Edition units</div>
                  </div>
                )}
              </button>
              {deployBrushUnit && (
                <button onClick={() => setDeployBrushUnit(null)} style={{
                  padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                  background: "#f0ebe2", border: "1.5px solid #d0c4aa", color: "#8a7e6e",
                  fontFamily: "'Cinzel', serif", fontSize: 9,
                }}>✕</button>
              )}
            </div>

            {/* Weapon Selection Panel */}
            {deployBrushUnit && (deployRangedWeapons.length > 0 || deployMeleeWeapons.length > 0 || deploySgtCategory) && (
              <div style={{
                padding: 10, borderRadius: 6, marginBottom: 8,
                background: "rgba(91,74,138,0.03)", border: "1px solid rgba(91,74,138,0.12)"
              }}>
                {/* Ranged Weapons */}
                {deployRangedWeapons.length > 0 && (
                  <div style={{ marginBottom: deployMeleeWeapons.length > 0 || deploySgtCategory ? 8 : 0 }}>
                    <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#b8860b", letterSpacing: 1, marginBottom: 4 }}>🔫 RANGED WEAPON</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {deployRangedWeapons.map((w, i) => {
                        const active = deployBrushRangedWeapon?.name === w.name;
                        return (
                          <button key={i} onClick={() => setDeployBrushRangedWeapon(active ? null : w)} style={{
                            padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 9,
                            fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                            background: active ? "rgba(184,134,11,0.12)" : "#f8f4ec",
                            border: `1.5px solid ${active ? "#b8860b" : "#e0d8c8"}`,
                            color: active ? "#b8860b" : "#6a5e4e",
                          }}>
                            {w.name}
                            <span style={{ fontSize: 8, color: "#8a7e6e", marginLeft: 3 }}>S{w.s} AP{w.ap}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Melee Weapons */}
                {deployMeleeWeapons.length > 0 && (
                  <div style={{ marginBottom: deploySgtCategory ? 8 : 0 }}>
                    <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#9b2d2d", letterSpacing: 1, marginBottom: 4 }}>🗡 MELEE WEAPON</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {deployMeleeWeapons.map((w, i) => {
                        const active = deployBrushMeleeWeapon?.name === w.name;
                        return (
                          <button key={i} onClick={() => setDeployBrushMeleeWeapon(active ? null : w)} style={{
                            padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 9,
                            fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                            background: active ? "rgba(155,45,45,0.12)" : "#f8f4ec",
                            border: `1.5px solid ${active ? "#9b2d2d" : "#e0d8c8"}`,
                            color: active ? "#9b2d2d" : "#6a5e4e",
                          }}>
                            {w.name}
                            <span style={{ fontSize: 8, color: "#8a7e6e", marginLeft: 3 }}>WS{w.ws} S{w.s} AP{w.ap}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sergeant */}
                {deploySgtCategory && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#5b4a8a", letterSpacing: 1 }}>★ SERGEANT</div>
                      <button onClick={() => {
                        const next = !deployBrushSgtEnabled;
                        setDeployBrushSgtEnabled(next);
                        if (!next) setDeployBrushSgtWeapon(null);
                        else if (deploySgtWeapons.length > 0 && !deployBrushSgtWeapon) setDeployBrushSgtWeapon(deploySgtWeapons[0]);
                      }} style={{
                        padding: "2px 10px", borderRadius: 3, cursor: "pointer", fontSize: 9,
                        fontFamily: "'Cinzel', serif", fontWeight: deployBrushSgtEnabled ? 700 : 400,
                        background: deployBrushSgtEnabled ? "rgba(91,74,138,0.12)" : "#f8f4ec",
                        border: `1.5px solid ${deployBrushSgtEnabled ? "#5b4a8a" : "#e0d8c8"}`,
                        color: deployBrushSgtEnabled ? "#5b4a8a" : "#8a7e6e",
                      }}>
                        {deployBrushSgtEnabled ? "✓ ENABLED" : "ADD SGT"}
                      </button>
                    </div>
                    {deployBrushSgtEnabled && deploySgtWeapons.length > 0 && (
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {deploySgtWeapons.map((w, i) => {
                          const active = deployBrushSgtWeapon?.name === w.name;
                          return (
                            <button key={i} onClick={() => setDeployBrushSgtWeapon(w)} style={{
                              padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 9,
                              fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                              background: active ? "rgba(91,74,138,0.12)" : "#f8f4ec",
                              border: `1.5px solid ${active ? "#5b4a8a" : "#e0d8c8"}`,
                              color: active ? "#5b4a8a" : "#6a5e4e",
                            }}>
                              {w.name}
                              <span style={{ fontSize: 8, color: "#8a7e6e", marginLeft: 3 }}>S{w.s} AP{w.ap}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Equipment Options (Troops & Elites only) */}
                {deployBrushUnit && canTakeEquipment(deployBrushUnit.id) && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(91,74,138,0.08)" }}>
                    <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#2e5e3e", letterSpacing: 1, marginBottom: 5 }}>⚑ EQUIPMENT</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {Object.entries(EQUIPMENT_OPTIONS).map(([key, eq]) => {
                        const active = deployBrushEquipment[key];
                        return (
                          <button key={key} onClick={() => setDeployBrushEquipment(prev => ({ ...prev, [key]: !prev[key] }))} title={`${eq.desc} (+${eq.cost}pts)`} style={{
                            padding: "4px 9px", borderRadius: 4, cursor: "pointer", fontSize: 9,
                            fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                            background: active ? "rgba(46,94,62,0.12)" : "#f8f4ec",
                            border: `1.5px solid ${active ? "#2e5e3e" : "#e0d8c8"}`,
                            color: active ? "#2e5e3e" : "#6a5e4e",
                            transition: "all 0.12s ease",
                          }}>
                            {eq.icon} {eq.label}
                            <span style={{ fontSize: 7, color: active ? "#2e5e3e" : "#a09888", marginLeft: 3 }}>+{eq.cost}pts</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick-place type palette */}
            <details style={{ marginTop: 2 }}>
              <summary style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, cursor: "pointer", marginBottom: 6 }}>
                ▸ QUICK-PLACE BY TYPE (generic markers)
              </summary>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", paddingTop: 6 }}>
                {DEPLOY_UNIT_TYPES.map(ut => {
                  const active = !deployBrushUnit && deploySelectedUnit === ut.id;
                  const playerCol = deployPlayer === "p1" ? "#9b2d2d" : "#2a6fb4";
                  return (
                    <button key={ut.id} onClick={() => { setDeploySelectedUnit(active ? null : ut.id); setDeployBrushUnit(null); }} title={ut.desc} style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                      borderRadius: 5, cursor: "pointer", transition: "all 0.15s ease",
                      background: active ? `rgba(${deployPlayer === "p1" ? "155,45,45" : "42,111,180"},0.12)` : "#f8f4ec",
                      border: `1.5px solid ${active ? playerCol : "#e0d8c8"}`,
                      boxShadow: active ? `0 0 8px rgba(${deployPlayer === "p1" ? "155,45,45" : "42,111,180"},0.2)` : "none",
                    }}>
                      <span style={{ fontSize: 16, lineHeight: 1, color: active ? playerCol : "#6a5e4e" }}>{ut.symbol}</span>
                      <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400, color: active ? playerCol : "#6a5e4e" }}>{ut.label}</span>
                    </button>
                  );
                })}
              </div>
            </details>
          </div>

          {/* Unit Selector Modal */}
          {deployModalOpen && (
            <UnitSelectorModal
              presets={UNIT_PRESETS}
              selectedId={deployBrushUnit?.name}
              onSelect={(unit) => {
                setDeployBrushUnit(unit);
                setDeployBrushModels(unit.models || 1);
                setDeploySelectedUnit(null);
                setDeployModalOpen(false);
                // Auto-select first available weapons
                const rw = WEAPON_PROFILES[unit.id] || [];
                setDeployBrushRangedWeapon(rw.length > 0 ? rw[0] : null);
                const mw = MELEE_WEAPON_PROFILES[unit.id] || [];
                setDeployBrushMeleeWeapon(mw.length > 0 ? mw[0] : null);
                // Sergeant
                const sgtCat = getSgtCategory(unit.id);
                const hasSgt = unit.hasSgt && sgtCat;
                setDeployBrushSgtEnabled(!!hasSgt);
                const sgtW = sgtCat ? (SERGEANT_WEAPONS[sgtCat] || []) : [];
                setDeployBrushSgtWeapon(sgtW.length > 0 ? sgtW[0] : null);
                // Reset equipment
                setDeployBrushEquipment({ vexilla: false, noxVox: false, metaBomb: false });
              }}
              onClose={() => setDeployModalOpen(false)}
              accentColor="#5b4a8a"
              title="SELECT UNIT TO DEPLOY"
            />
          )}

          {/* THE MAP */}
          {renderBoard({
            refObj: boardRef,
            onClick: handleBoardClick,
            cursorMode: (deployBrushUnit || deploySelectedUnit) ? "crosshair" : "default",
            showZones: deployShowZones,
            showMoveRange: false,
            moveRangeUnit: null,
            unitOnClick: (unit, e) => removeDeployedUnit(unit.id),
          })}

          {/* Placement Summary — below the map */}
          {deployBrushUnit && (
            <div style={{
              padding: "8px 14px", borderRadius: 6, marginBottom: 12,
              background: "rgba(91,74,138,0.06)", border: "1.5px solid rgba(91,74,138,0.18)",
            }}>
              <div style={{ fontSize: 11, fontFamily: "'EB Garamond', serif", color: "#5b4a8a", fontStyle: "italic" }}>
                ✦ Click on the map to place: <strong>{deployBrushUnit.name}</strong> ({deployBrushModels} model{deployBrushModels !== 1 ? "s" : ""})
                {deployBrushRangedWeapon && <span> · 🔫 {deployBrushRangedWeapon.name}</span>}
                {deployBrushMeleeWeapon && <span> · 🗡 {deployBrushMeleeWeapon.name}</span>}
                {deployBrushSgtEnabled && deployBrushSgtWeapon && <span> · ★ Sgt: {deployBrushSgtWeapon.name}</span>}
              </div>
            </div>
          )}

          {/* Deployed Units List */}
          <div style={{ ...panelStyle, marginBottom: 16 }}>
            <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#5b4a8a", fontSize: 16 }}>📋</span>
                <span style={{ color: "#5b4a8a" }}>DEPLOYED UNITS ({deployedUnits.length})</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <MiniStat label="P1" value={deployedUnits.filter(u => u.player === "p1").length} color="#9b2d2d" />
                <MiniStat label="P2" value={deployedUnits.filter(u => u.player === "p2").length} color="#2a6fb4" />
              </div>
            </div>

            {/* Points totals bar */}
            {(() => {
              const p1pts = deployedUnits.filter(u => u.player === "p1").reduce((sum, u) => sum + (calcUnitPoints(u) ?? 0), 0);
              const p2pts = deployedUnits.filter(u => u.player === "p2").reduce((sum, u) => sum + (calcUnitPoints(u) ?? 0), 0);
              const hasAny = deployedUnits.some(u => calcUnitPoints(u) !== null);
              if (!hasAny) return null;
              return (
                <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: "6px 10px", borderRadius: 4, background: "#f4f0e8", border: "1px solid #e0d8c8" }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#9b2d2d", letterSpacing: 1 }}>PLAYER 1</div>
                    <div style={{ fontSize: 16, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#9b2d2d" }}>{p1pts} <span style={{ fontSize: 10 }}>pts</span></div>
                  </div>
                  <div style={{ width: 1, background: "#d0c4aa" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#2a6fb4", letterSpacing: 1 }}>PLAYER 2</div>
                    <div style={{ fontSize: 16, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#2a6fb4" }}>{p2pts} <span style={{ fontSize: 10 }}>pts</span></div>
                  </div>
                  {p1pts > 0 && p2pts > 0 && (
                    <>
                      <div style={{ width: 1, background: "#d0c4aa" }} />
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#6a5e4e", letterSpacing: 1 }}>DIFFERENCE</div>
                        <div style={{ fontSize: 16, fontFamily: "'Cinzel', serif", fontWeight: 700, color: Math.abs(p1pts - p2pts) > 50 ? "#c74040" : "#5a7a3a" }}>
                          {Math.abs(p1pts - p2pts) === 0 ? "—" : `${Math.abs(p1pts - p2pts)}`}
                          <span style={{ fontSize: 10 }}>{Math.abs(p1pts - p2pts) > 0 ? ` (${p1pts > p2pts ? "P1" : "P2"} +)` : ""}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {deployedUnits.length === 0 ? (
              <div style={{ textAlign: "center", padding: "12px 0", fontSize: 11, color: "#a09888", fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>
                No units deployed. Select a unit from the roster or quick-place palette above and click on the map.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {deployedUnits.map((unit) => {
                  const isP1 = unit.player === "p1";
                  const col = isP1 ? "#9b2d2d" : "#2a6fb4";
                  const ud = unit.unitData;
                  const pts = calcUnitPoints(unit);
                  const pd = ud ? POINTS_DATA[ud.id] : null;

                  // Build points breakdown tooltip
                  let ptsBreakdown = "";
                  if (pd && ud) {
                    const extraModels = Math.max(0, ud.models - pd.minModels);
                    const parts = [`${pd.base}pts base (${pd.minModels} model${pd.minModels !== 1 ? "s" : ""})`];
                    if (extraModels > 0) parts.push(`+${extraModels}×${pd.perModel}pts models`);
                    if (unit.rangedWeapon) {
                      const wc = WEAPON_UPGRADE_COSTS[unit.rangedWeapon.name] ?? 0;
                      const nm = ud.models - (unit.sgtEnabled ? 1 : 0);
                      if (wc > 0) parts.push(`+${nm}×${wc}pts ${unit.rangedWeapon.name}`);
                    }
                    if (unit.sgtEnabled && unit.sgtWeapon) {
                      const sc = WEAPON_UPGRADE_COSTS[unit.sgtWeapon.name] ?? 0;
                      if (sc > 0) parts.push(`+${sc}pts Sgt: ${unit.sgtWeapon.name}`);
                    }
                    if (unit.equipment) {
                      if (unit.equipment.vexilla) parts.push(`+${EQUIPMENT_OPTIONS.vexilla.cost}pts Vexilla`);
                      if (unit.equipment.noxVox) parts.push(`+${EQUIPMENT_OPTIONS.noxVox.cost}pts Nox-Vox`);
                      if (unit.equipment.metaBomb) parts.push(`+${EQUIPMENT_OPTIONS.metaBomb.cost}pts Melta Bombs`);
                    }
                    ptsBreakdown = parts.join(" | ");
                  }

                  return (
                    <div key={unit.id} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "5px 10px",
                      borderRadius: 4, background: isP1 ? "rgba(155,45,45,0.04)" : "rgba(42,111,180,0.04)",
                      border: `1px solid ${isP1 ? "rgba(155,45,45,0.1)" : "rgba(42,111,180,0.1)"}`,
                    }}>
                      <span style={{ fontSize: 14, color: col }}>{unit.symbol}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 11, fontFamily: "'Cinzel', serif", fontWeight: 600, color: col }}>{unit.label}</span>
                          {ud && (
                            <span style={{ fontSize: 9, color: "#8a7e6e", fontFamily: "'EB Garamond', serif" }}>
                              {ud.models}× · T{ud.t} W{ud.w} Sv{ud.sv}{ud.inv && ud.inv !== "-" ? ` Inv${ud.inv}` : ""}
                            </span>
                          )}
                        </div>
                        {(unit.rangedWeapon || unit.meleeWeapon || unit.sgtEnabled) && (
                          <div style={{ fontSize: 8, color: "#8a7e6e", fontFamily: "'EB Garamond', serif", marginTop: 1 }}>
                            {unit.rangedWeapon && <span style={{ color: "#b8860b" }}>🔫 {unit.rangedWeapon.name}</span>}
                            {unit.rangedWeapon && unit.meleeWeapon && <span> · </span>}
                            {unit.meleeWeapon && <span style={{ color: "#9b2d2d" }}>🗡 {unit.meleeWeapon.name}</span>}
                            {unit.sgtEnabled && unit.sgtWeapon && <span style={{ color: "#5b4a8a" }}> · ★ {unit.sgtWeapon.name}</span>}
                          </div>
                        )}
                        {unit.equipment && (unit.equipment.vexilla || unit.equipment.noxVox || unit.equipment.metaBomb) && (
                          <div style={{ fontSize: 8, color: "#2e5e3e", fontFamily: "'EB Garamond', serif", marginTop: 1 }}>
                            {unit.equipment.vexilla && <span title="Re-roll failed Morale (Shooting & Assault)">⚑ Vexilla</span>}
                            {unit.equipment.vexilla && (unit.equipment.noxVox || unit.equipment.metaBomb) && <span style={{ color: "#8a7e6e" }}> · </span>}
                            {unit.equipment.noxVox && <span title="+1 Ld to Leadership & Cooldown checks">📡 Nox-Vox</span>}
                            {unit.equipment.noxVox && unit.equipment.metaBomb && <span style={{ color: "#8a7e6e" }}> · </span>}
                            {unit.equipment.metaBomb && <span title="S8 AP1 Armourbane vs vehicles in assault">💣 Melta Bombs</span>}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>{unit.x}" , {unit.y}"</span>
                      {/* Points badge */}
                      {pts !== null ? (
                        <div title={ptsBreakdown} style={{
                          display: "flex", flexDirection: "column", alignItems: "center",
                          padding: "2px 7px", borderRadius: 4, minWidth: 38,
                          background: isP1 ? "rgba(155,45,45,0.1)" : "rgba(42,111,180,0.1)",
                          border: `1px solid ${isP1 ? "rgba(155,45,45,0.25)" : "rgba(42,111,180,0.25)"}`,
                          cursor: "help",
                        }}>
                          <span style={{ fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 700, color: col, lineHeight: 1 }}>{pts}</span>
                          <span style={{ fontSize: 7, fontFamily: "'Cinzel', serif", color: col, opacity: 0.7, letterSpacing: 0.5 }}>pts</span>
                        </div>
                      ) : (
                        <div style={{ width: 38, textAlign: "center", fontSize: 8, color: "#c0b498", fontFamily: "'Cinzel', serif" }}>—</div>
                      )}
                      <span style={{ fontSize: 8, fontFamily: "'Cinzel', serif", color: col, letterSpacing: 0.5 }}>{unit.player.toUpperCase()}</span>
                      <button onClick={() => removeDeployedUnit(unit.id)} style={{
                        background: "none", border: "none", color: "#c74040", cursor: "pointer", fontSize: 12, padding: "0 4px",
                      }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>)}

        {/* ━━━━━━━━━━━ MOVEMENT PHASE ━━━━━━━━━━━ */}
        {activePhase === "movement" && (<>
          {/* Controls */}
          <div style={{ ...panelStyle, marginBottom: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🚶</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "#6b5b2e", letterSpacing: 2 }}>MOVEMENT PHASE</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>Zoom:</span>
                {[6, 8, 10, 12, 14].map(z => (
                  <button key={z} onClick={() => setDeployScale(z)} style={{
                    padding: "3px 7px", borderRadius: 3, fontSize: 9, cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontWeight: deployScale === z ? 700 : 400,
                    background: deployScale === z ? "rgba(107,91,46,0.12)" : "#f0ebe2",
                    border: `1px solid ${deployScale === z ? "#6b5b2e" : "#d0c4aa"}`,
                    color: deployScale === z ? "#6b5b2e" : "#8a7e6e",
                  }}>{z}px</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
              <CheckToggle checked={deployShowGrid} label="Grid Lines" onChange={setDeployShowGrid} />
              <CheckToggle checked={deployShowZones} label="Deploy Zones" onChange={setDeployShowZones} />
              <div style={{ flex: 1 }} />
              <button onClick={undoLastMove} disabled={moveLog.length === 0} style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 9, cursor: moveLog.length ? "pointer" : "default",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: moveLog.length ? "rgba(107,91,46,0.08)" : "#f0ebe2",
                border: `1.5px solid ${moveLog.length ? "#6b5b2e" : "#d0c4aa"}`,
                color: moveLog.length ? "#6b5b2e" : "#c0b498",
                opacity: moveLog.length ? 1 : 0.5,
              }}>↩ UNDO</button>
              <button onClick={resetAllMoves} disabled={moveLog.length === 0} style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 9, cursor: moveLog.length ? "pointer" : "default",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: moveLog.length ? "rgba(200,50,50,0.08)" : "#f0ebe2",
                border: `1.5px solid ${moveLog.length ? "#c74040" : "#d0c4aa"}`,
                color: moveLog.length ? "#c74040" : "#c0b498",
                opacity: moveLog.length ? 1 : 0.5,
              }}>RESET MOVES ✕</button>
            </div>
          </div>

          {/* Instructions / Selected Unit Info */}
          <div style={{ ...panelStyle, marginBottom: 12, padding: "10px 14px" }}>
            {!moveSelectedId ? (
              <div style={{ fontSize: 11, fontFamily: "'EB Garamond', serif", color: "#6a5e4e", textAlign: "center" }}>
                <strong style={{ fontFamily: "'Cinzel', serif", color: "#6b5b2e" }}>SELECT A UNIT</strong> on the map to move it. Units highlighted with a gold ring can be clicked to begin movement.
              </div>
            ) : (() => {
              const su = deployedUnits.find(u => u.id === moveSelectedId);
              if (!su) return null;
              const maxM = MOVE_VALUES[su.type] || 7;
              const isP1 = su.player === "p1";
              const pCol = isP1 ? "#9b2d2d" : "#2a6fb4";
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 6, fontSize: 20,
                    background: isP1 ? "rgba(200,60,60,0.85)" : "rgba(50,120,200,0.85)",
                    color: "#fff", border: "2px solid #ffd700", boxShadow: "0 0 10px rgba(255,215,0,0.4)",
                  }}>{su.symbol}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: pCol }}>{su.label}</div>
                    <div style={{ fontSize: 10, color: "#8a7e6e", fontFamily: "'EB Garamond', serif" }}>
                      Position: {su.x}", {su.y}" · Movement: <strong style={{ color: "#6b5b2e" }}>{maxM}"</strong>
                      {movedUnitIds.has(su.id) && <span style={{ color: "#c46a1b", marginLeft: 6 }}>⚠ Already moved</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 24, color: "#6b5b2e" }}>{maxM}"</div>
                    <div style={{ fontSize: 8, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1 }}>MAX MOVE</div>
                  </div>
                  <button onClick={() => setMoveSelectedId(null)} style={{
                    padding: "5px 12px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontWeight: 600,
                    background: "#f0ebe2", border: "1.5px solid #d0c4aa", color: "#8a7e6e",
                  }}>CANCEL</button>
                </div>
              );
            })()}
          </div>

          {/* The Map */}
          {renderBoard({
            refObj: moveBoardRef,
            onClick: handleMoveMapClick,
            cursorMode: moveSelectedId ? "crosshair" : "pointer",
            showZones: deployShowZones,
            showMoveRange: !!moveSelectedId,
            moveRangeUnit: moveSelectedId,
            unitOnClick: (unit, e) => {
              if (moveSelectedId) return; // already moving, let map click handle
              setMoveSelectedId(unit.id);
            },
          })}

          {/* Movement Reference */}
          <div style={{ ...panelStyle, marginBottom: 12 }}>
            <div style={{ ...panelHeaderStyle }}>
              <span style={{ color: "#6b5b2e", fontSize: 16 }}>📏</span>
              <span style={{ color: "#6b5b2e" }}>MOVEMENT VALUES</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {DEPLOY_UNIT_TYPES.filter(u => u.id !== "objective").map(ut => (
                <div key={ut.id} style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                  borderRadius: 4, background: "rgba(107,91,46,0.04)", border: "1px solid rgba(107,91,46,0.1)",
                }}>
                  <span style={{ fontSize: 12, lineHeight: 1 }}>{ut.symbol}</span>
                  <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#6a5e4e" }}>{ut.label}</span>
                  <span style={{ fontSize: 10, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#6b5b2e" }}>{MOVE_VALUES[ut.id] || 0}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Movement Log */}
          {moveLog.length > 0 && (
            <div style={{ ...panelStyle, marginBottom: 16 }}>
              <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#6b5b2e", fontSize: 16 }}>📋</span>
                  <span style={{ color: "#6b5b2e" }}>MOVEMENT LOG ({moveLog.length} moves)</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <MiniStat label="P1 Moves" value={moveLog.filter(m => m.player === "p1").length} color="#9b2d2d" />
                  <MiniStat label="P2 Moves" value={moveLog.filter(m => m.player === "p2").length} color="#2a6fb4" />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {moveLog.map((m, i) => {
                  const isP1 = m.player === "p1";
                  const col = isP1 ? "#9b2d2d" : "#2a6fb4";
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "4px 10px",
                      borderRadius: 4,
                      background: isP1 ? "rgba(155,45,45,0.04)" : "rgba(42,111,180,0.04)",
                      border: `1px solid ${isP1 ? "rgba(155,45,45,0.1)" : "rgba(42,111,180,0.1)"}`,
                    }}>
                      <span style={{ fontSize: 12, color: col }}>{m.symbol}</span>
                      <span style={{ fontSize: 11, fontFamily: "'Cinzel', serif", fontWeight: 600, color: col }}>{m.label}</span>
                      <span style={{ fontSize: 10, fontFamily: "'EB Garamond', serif", color: "#6a5e4e", flex: 1 }}>
                        ({m.fromX}", {m.fromY}") → ({m.toX}", {m.toY}")
                      </span>
                      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: "#6b5b2e" }}>
                        {m.distance}"
                      </span>
                      <span style={{ fontSize: 8, color: "#a09888" }}>/ {m.maxMove}"</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>)}

        {/* ━━━━━━━━━━━ SHOOTING PHASE ━━━━━━━━━━━ */}
        {activePhase === "shooting" && (<>
        {/* Tactical Map */}
        {deployedUnits.length > 0 && renderTacticalMap({
          refObj: shootMapRef,
          phase: "shooting",
          onUnitClick: (unit) => {
            if (!mapAttackerId) { handleMapAttackerSelect(unit); }
            else if (!mapTargetId && unit.id !== mapAttackerId) { handleMapTargetSelect(unit); }
            else if (unit.id === mapAttackerId) { setMapAttackerId(null); setMapTargetId(null); }
            else { handleMapTargetSelect(unit); }
          },
        })}
        {/* Map Action Bar — Charge & Route */}
        {mapAttackerId && mapTargetId && (
          <div style={{ ...panelStyle, marginBottom: 12, display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 14px", alignItems: "center" }}>
            <button onClick={() => {
              const atkUnit = deployedUnits.find(u => u.id === mapAttackerId);
              const defUnit = deployedUnits.find(u => u.id === mapTargetId);
              if (!atkUnit || !defUnit) return;
              const dist = getDistanceBetween(atkUnit, defUnit);
              setShowCharge(true);
              if (dist !== null) setChargeDistance(Math.ceil(dist));
              if (atkUnit.meleeWeapon) {
                setChargerWS(atkUnit.meleeWeapon.ws);
                setChargerS_melee(atkUnit.meleeWeapon.s);
                setChargerAP_melee(atkUnit.meleeWeapon.ap);
                setChargerI(atkUnit.meleeWeapon.i);
                setChargerA(atkUnit.meleeWeapon.a);
              }
              if (atkUnit.unitData) {
                setChargerT_melee(atkUnit.unitData.t || 4);
                setChargerSv(atkUnit.unitData.sv || "3");
                setChargerInvSv(atkUnit.unitData.inv || "-");
                setChargerFnpSv(atkUnit.unitData.fnp || "-");
                setChargerW_melee(atkUnit.unitData.w || 1);
              }
              if (defUnit.meleeWeapon) {
                setDefenderWS(defUnit.meleeWeapon.ws);
                setDefenderS_melee(defUnit.meleeWeapon.s);
                setDefenderAP_melee(defUnit.meleeWeapon.ap);
                setDefenderI(defUnit.meleeWeapon.i);
                setDefenderA(defUnit.meleeWeapon.a);
              }
            }} style={{
              padding: "6px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
              fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
              background: "rgba(155,45,45,0.1)", border: "1.5px solid #9b2d2d", color: "#9b2d2d",
            }}>⚔ DECLARE CHARGE</button>
            <button onClick={() => routUnit(mapTargetId)} style={{
              padding: "6px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
              fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
              background: "rgba(200,50,50,0.08)", border: "1.5px solid #c74040", color: "#c74040",
            }}>💨 ROUTE TARGET</button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 9, fontFamily: "'EB Garamond', serif", color: "#8a7e6e", fontStyle: "italic" }}>
              Map selection auto-fills attacker & target stats below
            </span>
          </div>
        )}
        {/* Input Panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>

          {/* ATTACKER PANEL */}
          <div style={panelStyle}>
            <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#b8860b", fontSize: 16 }}>⚔</span>
                <span>ATTACKING UNIT</span>
              </div>
            </div>
            {/* Selected Unit Display / Select Button */}
            <div style={{ marginBottom: 14 }}>
              {selectedUnit ? (
                <button onClick={() => setShowAttackerPresets(true)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(184,134,11,0.06)", border: "1.5px solid #b8860b",
                  transition: "all 0.15s ease", textAlign: "left"
                }}>
                  <UnitIcon type={getUnitIconType(selectedUnit.name)} size={40} color="#b8860b" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "#2a2418" }}>{selectedUnit.name}</div>
                    <div style={{ fontSize: 10, color: "#8a7e6e", fontFamily: "'Cinzel', serif" }}>
                      {selectedUnit.models} model{selectedUnit.models > 1 ? "s" : ""} · BS{selectedUnit.bs}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#b8860b", fontFamily: "'Cinzel', serif" }}>CHANGE ▸</span>
                </button>
              ) : (
                <button onClick={() => setShowAttackerPresets(true)} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "14px", borderRadius: 8, cursor: "pointer",
                  background: "#f9f6f0", border: "1.5px dashed #c0b498",
                  color: "#8a7e6e", fontFamily: "'Cinzel', serif", fontSize: 12,
                  letterSpacing: 1, transition: "all 0.15s ease"
                }}>
                  <span style={{ fontSize: 18 }}>+</span> SELECT UNIT
                </button>
              )}
            </div>
            {showAttackerPresets && (
              <UnitSelectorModal
                presets={UNIT_PRESETS}
                selectedId={selectedUnit?.id}
                title="SELECT ATTACKING UNIT"
                accentColor="#b8860b"
                onClose={() => setShowAttackerPresets(false)}
                onSelect={applyUnitPreset}
              />
            )}
            {/* Weapon Loadout Selector */}
            {selectedUnit && availableWeapons.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <WeaponSelector
                  weapons={availableWeapons}
                  selectedWeaponName={selectedWeapon?.name}
                  onSelect={applyWeaponPreset}
                />
              </div>
            )}
            {/* Selected weapon summary */}
            {selectedWeapon && (
              <div style={{
                marginBottom: 14, padding: "8px 12px", borderRadius: 6,
                background: "rgba(184,134,11,0.06)", border: "1px solid #e0dbd0",
                fontSize: 12, color: "#4a4030", fontFamily: "'EB Garamond', serif",
                display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center"
              }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: "#b8860b" }}>{selectedWeapon.name}</span>
                <span>{selectedWeapon.type} {selectedWeapon.shots}</span>
                <span>S{selectedWeapon.s}</span>
                <span>AP{selectedWeapon.ap}</span>
                <span>D{selectedWeapon.damage}</span>
                {Object.keys(selectedWeapon.rules || {}).filter(k => selectedWeapon.rules[k]).map(k => {
                  const rule = SPECIAL_RULES.find(r => r.id === k);
                  return rule ? <span key={k} style={{ color: "#8b6508", fontSize: 11 }}>{rule.label}</span> : null;
                })}
              </div>
            )}
            {/* Sergeant Options */}
            {selectedUnit && selectedUnit.hasSgt && availableSgtWeapons.length > 0 && (
              <div style={{
                marginBottom: 14, padding: "10px 14px", borderRadius: 8,
                background: sgtEnabled ? "rgba(107,63,138,0.06)" : "#f9f6f0",
                border: `1.5px solid ${sgtEnabled ? "#6b3f8a" : "#e0dbd0"}`,
                transition: "all 0.15s ease"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sgtEnabled ? 10 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, color: sgtEnabled ? "#6b3f8a" : "#8a7e6e" }}>⚔</span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 11, color: sgtEnabled ? "#6b3f8a" : "#8a7e6e", letterSpacing: 1 }}>SERGEANT</span>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontFamily: "'Cinzel', serif", color: sgtEnabled ? "#6b3f8a" : "#8a7e6e" }}>
                    <input type="checkbox" checked={sgtEnabled} onChange={e => setSgtEnabled(e.target.checked)} style={{ accentColor: "#6b3f8a" }} />
                    {sgtEnabled ? "Included" : "Include Sergeant"}
                  </label>
                </div>
                {sgtEnabled && (
                  <>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {availableSgtWeapons.map(w => {
                        const active = sgtWeapon?.name === w.name;
                        return (
                          <button key={w.name} onClick={() => setSgtWeapon(w)} style={{
                            padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                            fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                            background: active ? "rgba(107,63,138,0.18)" : "#f0ebe2",
                            border: `1.5px solid ${active ? "#6b3f8a" : "#d0c4aa"}`,
                            color: active ? "#6b3f8a" : "#6a5e4e",
                            transition: "all 0.15s ease", textAlign: "left",
                            display: "flex", flexDirection: "column", gap: 1, minWidth: 100,
                          }}>
                            <div style={{ fontWeight: 600, fontSize: 11 }}>{w.name}</div>
                            <div style={{ fontSize: 8, color: active ? "#5a2e7a" : "#8a7e6e", letterSpacing: 0.5 }}>
                              {w.type} {w.shots} · S{w.s} AP{w.ap}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {sgtWeapon && (
                      <div style={{
                        marginTop: 8, padding: "6px 10px", borderRadius: 4,
                        background: "rgba(107,63,138,0.06)", fontSize: 11,
                        color: "#4a4030", fontFamily: "'EB Garamond', serif",
                        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"
                      }}>
                        <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: "#6b3f8a", fontSize: 10 }}>SGT WEAPON:</span>
                        <span>{sgtWeapon.name}</span>
                        <span>{sgtWeapon.type} {sgtWeapon.shots}</span>
                        <span>S{sgtWeapon.s} AP{sgtWeapon.ap} D{sgtWeapon.damage || 1}</span>
                        {Object.keys(sgtWeapon.rules || {}).filter(k => sgtWeapon.rules[k]).map(k => {
                          const rule = SPECIAL_RULES.find(r => r.id === k);
                          return rule ? <span key={k} style={{ color: "#6b3f8a", fontSize: 10 }}>{rule.label}</span> : null;
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Cinzel', serif", display: "block", marginBottom: 6 }}>Weapon Type</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {WEAPON_TYPES.map(t => (
                  <button key={t} onClick={() => setWeaponType(t)} style={{
                    padding: "6px 14px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontWeight: weaponType === t ? 700 : 400,
                    background: weaponType === t ? "rgba(184,134,11,0.25)" : "#f0ebe2",
                    border: `1px solid ${weaponType === t ? "#b8860b" : "#d0c4aa"}`,
                    color: weaponType === t ? "#b8860b" : "#8a7e6e",
                    transition: "all 0.15s ease"
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <NumberInput label="Models" value={numModels} onChange={setNumModels} min={1} max={40} />
              <NumberInput label="Shots/Model" value={numShots} onChange={setNumShots} min={1} max={20} />
              <NumberInput label="BS" value={bs} onChange={setBs} min={1} max={10} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <NumberInput label="Strength" value={strength} onChange={setStrength} min={1} max={20} />
              <SelectInput label="AP" value={ap} onChange={setAp} options={apOptions} />
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {weaponType === "Rapid Fire" && (
                <CheckToggle checked={halfRange} label="Half Range" onChange={setHalfRange} />
              )}
              <CheckToggle checked={moved} label="Moved" onChange={setMoved} />
              {weaponType === "Barrage" && (
                <CheckToggle checked={indirect} label="Indirect Fire (no LoS)" onChange={setIndirect} />
              )}
            </div>
          </div>

          {/* DEFENDER PANEL */}
          <div style={panelStyle}>
            <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#2a6fb4", fontSize: 16 }}>🛡</span>
                <span>TARGET UNIT</span>
              </div>
            </div>
            {/* Selected Target Display / Select Button */}
            <div style={{ marginBottom: 14 }}>
              {targetPresetName ? (
                <button onClick={() => setShowTargetPresets(true)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(42,111,180,0.06)", border: "1.5px solid #2a6fb4",
                  transition: "all 0.15s ease", textAlign: "left"
                }}>
                  <UnitIcon type={getUnitIconType(targetPresetName)} size={40} color="#2a6fb4" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "#2a2418" }}>{targetPresetName}</div>
                    <div style={{ fontSize: 10, color: "#8a7e6e", fontFamily: "'Cinzel', serif" }}>
                      T{toughness} Sv{armourSave}+ {invulnSave !== "-" ? `Inv${invulnSave}+` : ""} {coverSave !== "-" ? `Cov${coverSave}+` : ""} {fnp !== "-" ? `FNP${fnp}+` : ""} Ld{leadership}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#2a6fb4", fontFamily: "'Cinzel', serif" }}>CHANGE ▸</span>
                </button>
              ) : (
                <button onClick={() => setShowTargetPresets(true)} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "14px", borderRadius: 8, cursor: "pointer",
                  background: "#f5f8fc", border: "1.5px dashed #a0bdd8",
                  color: "#6a8aaa", fontFamily: "'Cinzel', serif", fontSize: 12,
                  letterSpacing: 1, transition: "all 0.15s ease"
                }}>
                  <span style={{ fontSize: 18 }}>+</span> SELECT TARGET
                </button>
              )}
            </div>
            {showTargetPresets && (
              <UnitSelectorModal
                presets={UNIT_PRESETS}
                selectedId={targetPresetName}
                title="SELECT TARGET UNIT"
                accentColor="#2a6fb4"
                onClose={() => setShowTargetPresets(false)}
                onSelect={applyTargetPreset}
                isTarget={true}
              />
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <NumberInput label="Toughness" value={toughness} onChange={setToughness} min={1} max={20} />
              <SelectInput label="Armour Save" value={armourSave} onChange={setArmourSave} options={saveOptions} />
              <NumberInput label="Leadership" value={leadership} onChange={setLeadership} min={1} max={10} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <SelectInput label="Invuln Save" value={invulnSave} onChange={setInvulnSave} options={saveOptions} />
              <SelectInput label="Cover Save" value={coverSave} onChange={setCoverSave} options={saveOptions} />
              <SelectInput label="FNP" value={fnp} onChange={setFnp} options={saveOptions} />
              <NumberInput label="Unit Size" value={targetModels} onChange={setTargetModels} min={1} max={40} />
            </div>
            {/* Target Equipment */}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={() => setTargetHasVexilla(v => !v)} title={EQUIPMENT_OPTIONS.vexilla.desc} style={{
                padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 9,
                fontFamily: "'Cinzel', serif", fontWeight: targetHasVexilla ? 700 : 400,
                background: targetHasVexilla ? "rgba(46,94,62,0.12)" : "#f8f4ec",
                border: `1.5px solid ${targetHasVexilla ? "#2e5e3e" : "#e0d8c8"}`,
                color: targetHasVexilla ? "#2e5e3e" : "#8a7e6e",
                transition: "all 0.12s ease",
              }}>
                ⚑ Vexilla {targetHasVexilla ? "✓" : ""}
              </button>
              <button onClick={() => setTargetHasNoxVox(v => !v)} title={EQUIPMENT_OPTIONS.noxVox.desc} style={{
                padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 9,
                fontFamily: "'Cinzel', serif", fontWeight: targetHasNoxVox ? 700 : 400,
                background: targetHasNoxVox ? "rgba(46,94,62,0.12)" : "#f8f4ec",
                border: `1.5px solid ${targetHasNoxVox ? "#2e5e3e" : "#e0d8c8"}`,
                color: targetHasNoxVox ? "#2e5e3e" : "#8a7e6e",
                transition: "all 0.12s ease",
              }}>
                📡 Nox-Vox {targetHasNoxVox ? "✓" : ""}
              </button>
              {(targetHasVexilla || targetHasNoxVox) && (
                <span style={{ fontSize: 8, color: "#2e5e3e", fontFamily: "'EB Garamond', serif", alignSelf: "center", fontStyle: "italic" }}>
                  {targetHasVexilla ? "Re-roll Morale" : ""}{targetHasVexilla && targetHasNoxVox ? " · " : ""}{targetHasNoxVox ? "+1 Ld checks" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SPECIAL RULES */}
        <div style={{ ...panelStyle, marginBottom: 16 }}>
          <div style={panelHeaderStyle}>
            <span style={{ color: "#c46a1b", fontSize: 16 }}>✦</span>
            <span>SPECIAL RULES</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SPECIAL_RULES.map(r => (
              <ToggleChip key={r.id} active={activeRules[r.id]} label={r.label} desc={r.desc} onClick={() => toggleRule(r.id)} />
            ))}
          </div>
        </div>

        {/* EXPECTED VALUES & RESOLVE BUTTON */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "stretch" }}>
          <div style={{ ...panelStyle, flex: 1, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            <StatBox label="Exp. Hits" value={expected.expHits} color="#b8860b" />
            <StatBox label="Exp. Wounds" value={expected.expWounds} color="#c74040" />
            <StatBox label="Exp. Unsaved" value={expected.expUnsaved} color="#2a6fb4" />
            <StatBox label="Exp. Casualties" value={expected.expCasualties} color="#2e7d32" />
          </div>
          <button onClick={handleResolve} style={{
            padding: "16px 36px", fontSize: 16, fontFamily: "'Cinzel', serif", fontWeight: 700,
            letterSpacing: 2, background: "linear-gradient(180deg, #c9a020 0%, #a07a10 100%)",
            border: "none", borderRadius: 6, color: "#fff", cursor: "pointer",
            textTransform: "uppercase", whiteSpace: "nowrap",
            boxShadow: "0 2px 12px rgba(184,134,11,0.25)"
          }}>
            ⚔ RESOLVE
          </button>
        </div>

        {/* RESULTS */}
        {result && (
          <div style={{ ...panelStyle, animation: "fadeIn 0.3s ease", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={panelHeaderStyle}>
                <span style={{ color: "#2e7d32", fontSize: 16 }}>☠</span>
                <span>RESOLUTION LOG</span>
              </div>
              <div style={{
                background: result.casualties > 0 ? "rgba(199,48,48,0.1)" : "rgba(46,125,50,0.1)",
                border: `1px solid ${result.casualties > 0 ? "#c74040" : "#2e7d32"}`,
                borderRadius: 6, padding: "6px 16px",
                fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20,
                color: result.casualties > 0 ? "#c73030" : "#2e7d32",
                animation: result.casualties > 0 ? "pulseGold 2s infinite" : "none"
              }}>
                {result.casualties} CASUALT{result.casualties === 1 ? "Y" : "IES"}
              </div>
            </div>

            {/* Summary Bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <MiniStat label="Shots" value={result.totalShots} />
              <MiniStat label="Hits" value={result.hits} />
              <MiniStat label="Wounds" value={result.wounds} />
              <MiniStat label="Unsaved" value={result.unsaved} />
              <MiniStat label="Casualties" value={result.casualties} color={result.casualties > 0 ? "#c73030" : "#2e7d32"} />
              {result.getsHotWounds > 0 && <MiniStat label="Gets Hot! Wounds" value={result.getsHotWounds} color="#c73030" />}
              {result.deflagrateHits > 0 && <MiniStat label="Deflagrate Hits" value={result.deflagrateHits} color="#c46a1b" />}
            </div>

            {/* Status Effects */}
            {result.statusEffects && result.statusEffects.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {result.statusEffects.map((s, i) => (
                  <div key={i} style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 12,
                    fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 1,
                    background: s === "Falling Back" || s === "Panicked" ? "rgba(199,48,48,0.15)" : "rgba(139,90,43,0.15)",
                    border: `1px solid ${s === "Falling Back" || s === "Panicked" ? "#c73030" : "#8b5a2b"}`,
                    color: s === "Falling Back" || s === "Panicked" ? "#c73030" : "#8b5a2b",
                  }}>
                    {s === "Pinned" && "📌 "}{s === "Suppressed" && "🔻 "}{s === "Stunned" && "⚡ "}{s === "Panicked" && "😱 "}{s === "Falling Back" && "🏳 "}{s}
                  </div>
                ))}
              </div>
            )}

            {/* Leadership Rolls */}
            {result.ldRolls && result.ldRolls.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#6a5e4e", marginBottom: 6, fontFamily: "'Cinzel', serif" }}>LEADERSHIP CHECKS</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {result.ldRolls.map((lr, i) => (
                    <div key={i} style={{
                      padding: "5px 12px", borderRadius: 4, fontSize: 12,
                      fontFamily: "'Cinzel', serif",
                      background: lr.passed ? "rgba(46,125,50,0.1)" : "rgba(199,48,48,0.1)",
                      border: `1px solid ${lr.passed ? "#2e7d32" : "#c74040"}`,
                      color: lr.passed ? "#2e7d32" : "#c74040",
                    }}>
                      {lr.type}: {lr.roll.join("+")}={lr.total} vs Ld{lr.needed} → {lr.passed ? "✓ Passed" : "✗ Failed"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dice Display */}
            {result.rolls.hit.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#6a5e4e", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>TO HIT ROLLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {result.rolls.hit.map((r, i) => <DieIcon key={i} value={r.value} success={r.success} reroll={r.reroll} small />)}
                </div>
              </div>
            )}
            {result.rolls.wound.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#6a5e4e", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>TO WOUND ROLLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {result.rolls.wound.map((r, i) => <DieIcon key={i} value={r.value} success={r.success} reroll={r.reroll} small />)}
                </div>
              </div>
            )}
            {result.rolls.save.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#6a5e4e", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>SAVING THROWS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {result.rolls.save.map((r, i) => <DieIcon key={i} value={r.value} success={r.success} small />)}
                </div>
              </div>
            )}
            {result.rolls.fnpRolls && result.rolls.fnpRolls.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#6a5e4e", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>FEEL NO PAIN</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {result.rolls.fnpRolls.map((r, i) => <DieIcon key={i} value={r.value} success={r.success} small />)}
                </div>
              </div>
            )}

            {/* Detailed Log */}
            <div style={{ marginTop: 12, borderTop: "1px solid #d0c4aa", paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: "#8a7e6e", marginBottom: 8, fontFamily: "'Cinzel', serif" }}>DETAILED LOG</div>
              {result.log.map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: phaseColors[entry.phase], minWidth: 16, textAlign: "center" }}>{phaseIcons[entry.phase]}</span>
                  <span style={{ color: phaseColors[entry.phase], minWidth: 70, fontFamily: "'Cinzel', serif", fontSize: 10, lineHeight: "20px", textTransform: "uppercase" }}>{entry.phase}</span>
                  <span style={{ color: "#4a4030" }}>{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ━━━ RETURN FIRE PANEL (Shooting Phase Reaction) ━━━ */}
        {result && (
          <div style={{ ...panelStyle, marginBottom: 16, borderColor: doReturnFire ? "#8b4513" : "#d0c4aa", transition: "border-color 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: doReturnFire ? 12 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, color: "#8b4513" }}>🎯</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: "#8b4513", letterSpacing: 2 }}>RETURN FIRE REACTION</span>
              </div>
              <CheckToggle checked={doReturnFire} label="Enabled" onChange={(v) => { setDoReturnFire(v); if (!v) setReturnFireResult(null); }} />
            </div>

            {doReturnFire && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontSize: 10, color: "#8a7e6e", fontFamily: "'EB Garamond', serif", marginBottom: 10, fontStyle: "italic" }}>
                  Defender elects to fire back as a reaction — Snap Shots (6+ to hit)
                </div>

                {/* Weapon Selector */}
                {defenderRangedWeapons.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 4 }}>SELECT WEAPON</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {defenderRangedWeapons.map(w => {
                        const active = selectedReturnWeapon?.name === w.name;
                        return (
                          <button key={w.name} onClick={() => applyReturnWeapon(w)} style={{
                            padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                            fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                            background: active ? "rgba(139,69,19,0.15)" : "#f0ebe2",
                            border: `1.5px solid ${active ? "#8b4513" : "#d0c4aa"}`,
                            color: active ? "#6b3410" : "#6a5e4e",
                            transition: "all 0.15s ease", textAlign: "left",
                            display: "flex", flexDirection: "column", gap: 1, minWidth: 100,
                          }}>
                            <div style={{ fontWeight: 600, fontSize: 11 }}>{w.name}</div>
                            <div style={{ fontSize: 8, color: active ? "#5a2a0c" : "#8a7e6e", letterSpacing: 0.5 }}>
                              {w.shots} shots S{w.s} AP{w.ap} {w.type}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <NumberInput label="Shots/Model" value={returnFireShots} onChange={setReturnFireShots} min={1} max={10} />
                  <NumberInput label="Strength" value={returnFireS} onChange={setReturnFireS} min={1} max={10} />
                  <SelectInput label="AP" value={returnFireAP} onChange={setReturnFireAP} options={apOptions} />
                </div>

                <button onClick={handleReturnFire} style={{
                  width: "100%", padding: "12px 24px", fontSize: 14, fontFamily: "'Cinzel', serif", fontWeight: 700,
                  letterSpacing: 2, background: "linear-gradient(180deg, #a0622a 0%, #7a4a1a 100%)",
                  border: "none", borderRadius: 6, color: "#fff", cursor: "pointer",
                  textTransform: "uppercase", boxShadow: "0 2px 12px rgba(139,69,19,0.25)",
                  marginBottom: returnFireResult ? 14 : 0
                }}>
                  🎯 RESOLVE RETURN FIRE
                </button>

                {/* Return Fire Results */}
                {returnFireResult && (
                  <div style={{ animation: "fadeIn 0.3s ease", marginTop: 12 }}>
                    {/* Summary */}
                    <div style={{
                      display: "flex", gap: 12, alignItems: "center", justifyContent: "center",
                      padding: "10px 16px", borderRadius: 8, marginBottom: 12,
                      background: returnFireResult.casualties > 0 ? "rgba(139,69,19,0.08)" : "rgba(100,100,100,0.05)",
                      border: `2px solid ${returnFireResult.casualties > 0 ? "#8b4513" : "#aaa"}`
                    }}>
                      <span style={{ fontSize: 24 }}>{returnFireResult.casualties > 0 ? "🎯" : "✖"}</span>
                      <div style={{ textAlign: "center" }}>
                        <div style={{
                          fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 16, letterSpacing: 2,
                          color: returnFireResult.casualties > 0 ? "#8b4513" : "#8a7e6e"
                        }}>
                          {returnFireResult.casualties > 0 ? `${returnFireResult.casualties} ATTACKER MODEL(S) SLAIN` : "NO CASUALTIES"}
                        </div>
                      </div>
                    </div>

                    {/* Dice Displays */}
                    {returnFireResult.rolls.hit.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#8b4513", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>RETURN FIRE — TO HIT (6+)</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {returnFireResult.rolls.hit.map((d, i) => <DieIcon key={`rfh${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                    {returnFireResult.rolls.wound.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#8b4513", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>RETURN FIRE — TO WOUND</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {returnFireResult.rolls.wound.map((d, i) => <DieIcon key={`rfw${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                    {returnFireResult.rolls.save.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#8b4513", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>RETURN FIRE — SAVES</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {returnFireResult.rolls.save.map((d, i) => <DieIcon key={`rfs${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                    {returnFireResult.rolls.fnp && returnFireResult.rolls.fnp.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#8b4513", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>RETURN FIRE — FNP</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {returnFireResult.rolls.fnp.map((d, i) => <DieIcon key={`rff${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}

                    {/* Log */}
                    <div style={{ marginTop: 8 }}>
                      {returnFireResult.log.map((entry, i) => (
                        <div key={i} style={{
                          fontSize: 12, padding: "3px 8px", borderRadius: 4,
                          marginBottom: 2, display: "flex", alignItems: "center", gap: 6,
                          background: "rgba(139,69,19,0.04)"
                        }}>
                          <span style={{ fontSize: 10 }}>{phaseIcons[entry.phase] || "•"}</span>
                          <span style={{ color: phaseColors[entry.phase] || "#6a5e4e", fontFamily: "'EB Garamond', serif" }}>{entry.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ━━━ CHARGE PHASE PANEL ━━━ */}
        {result && (
          <div style={{ ...panelStyle, marginBottom: 16, borderColor: showCharge ? "#9b2d2d" : "#d0c4aa", transition: "border-color 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showCharge ? 16 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, color: "#9b2d2d" }}>🏃</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: "#9b2d2d", letterSpacing: 2 }}>CHARGE PHASE</span>
              </div>
              <button onClick={() => setShowCharge(!showCharge)} style={{
                padding: "6px 16px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 1,
                background: showCharge ? "rgba(155,45,45,0.15)" : "#f0ebe2",
                border: `1.5px solid ${showCharge ? "#9b2d2d" : "#d0c4aa"}`,
                color: showCharge ? "#9b2d2d" : "#8a7e6e",
                transition: "all 0.2s ease"
              }}>
                {showCharge ? "COLLAPSE ▴" : "DECLARE CHARGE ▾"}
              </button>
            </div>

            {showCharge && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                {/* Charge Setup Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <NumberInput label="Distance (inches)" value={chargeDistance} onChange={setChargeDistance} min={1} max={24} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end" }}>
                    <CheckToggle checked={chargeTerrain} label="Difficult Terrain (-2&quot;)" onChange={setChargeTerrain} />
                    <CheckToggle checked={chargeDisordered} label="Disordered Charge" onChange={setChargeDisordered} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end" }}>
                    <CheckToggle checked={doOverwatch} label="Overwatch" onChange={setDoOverwatch} />
                    <CheckToggle checked={doVolleyFire} label="Volley Fire" onChange={setDoVolleyFire} />
                  </div>
                </div>

                {/* Volley Fire Configuration */}
                {doVolleyFire && (
                  <div style={{
                    padding: 12, borderRadius: 6, marginBottom: 14,
                    background: "rgba(107,142,35,0.06)", border: "1px solid rgba(107,142,35,0.25)"
                  }}>
                    <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#6b8e23", letterSpacing: 1.5, marginBottom: 8 }}>
                      🔫 VOLLEY FIRE (CHARGER — ASSAULT WEAPONS, SNAP SHOTS 6+)
                    </div>
                    {chargerAssaultWeapons.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 4 }}>SELECT WEAPON</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {chargerAssaultWeapons.map(w => {
                            const active = selectedVolleyWeapon?.name === w.name;
                            return (
                              <button key={w.name} onClick={() => applyVolleyWeapon(w)} style={{
                                padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                                fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                                background: active ? "rgba(107,142,35,0.15)" : "#f0ebe2",
                                border: `1.5px solid ${active ? "#6b8e23" : "#d0c4aa"}`,
                                color: active ? "#4a6a10" : "#6a5e4e",
                                transition: "all 0.15s ease", textAlign: "left",
                                display: "flex", flexDirection: "column", gap: 1, minWidth: 100,
                              }}>
                                <div style={{ fontWeight: 600, fontSize: 11 }}>{w.name}</div>
                                <div style={{ fontSize: 8, color: active ? "#3a5a08" : "#8a7e6e", letterSpacing: 0.5 }}>
                                  {w.shots} shots S{w.s} AP{w.ap} {w.type}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <NumberInput label="Shots/Model" value={volleyFireShots} onChange={setVolleyFireShots} min={1} max={10} />
                      <NumberInput label="Strength" value={volleyFireS} onChange={setVolleyFireS} min={1} max={10} />
                      <SelectInput label="AP" value={volleyFireAP} onChange={setVolleyFireAP} options={apOptions} />
                    </div>
                  </div>
                )}

                {/* Overwatch Configuration */}
                {doOverwatch && (
                  <div style={{
                    padding: 12, borderRadius: 6, marginBottom: 14,
                    background: "rgba(196,106,27,0.06)", border: "1px solid rgba(196,106,27,0.2)"
                  }}>
                    <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#c46a1b", letterSpacing: 1.5, marginBottom: 8 }}>
                      🔥 OVERWATCH (DEFENDER FIRES)
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <NumberInput label="Shots/Model" value={overwatchShots} onChange={setOverwatchShots} min={1} max={10} />
                      <NumberInput label="Strength" value={overwatchS} onChange={setOverwatchS} min={1} max={10} />
                      <SelectInput label="AP" value={overwatchAP} onChange={setOverwatchAP} options={apOptions} />
                    </div>
                  </div>
                )}

                {/* Charger Melee & Defensive Stats (side by side) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 14 }}>
                  {/* Charger Melee */}
                  <div style={{
                    padding: 12, borderRadius: 6,
                    background: "rgba(155,45,45,0.05)", border: "1px solid rgba(155,45,45,0.15)"
                  }}>
                    <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#9b2d2d", letterSpacing: 1.5, marginBottom: 8 }}>
                      ⚔ CHARGER PROFILE
                    </div>
                    {/* Melee Weapon Selector */}
                    {chargerMeleeWeapons.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 4 }}>MELEE WEAPON</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {chargerMeleeWeapons.map(w => {
                            const active = selectedChargerMelee?.name === w.name;
                            return (
                              <button key={w.name} onClick={() => applyChargerMelee(w)} style={{
                                padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                                fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                                background: active ? "rgba(155,45,45,0.15)" : "#f0ebe2",
                                border: `1.5px solid ${active ? "#9b2d2d" : "#d0c4aa"}`,
                                color: active ? "#9b2d2d" : "#6a5e4e",
                                transition: "all 0.15s ease", textAlign: "left",
                                display: "flex", flexDirection: "column", gap: 1, minWidth: 100,
                              }}>
                                <div style={{ fontWeight: 600, fontSize: 11 }}>{w.name}</div>
                                <div style={{ fontSize: 8, color: active ? "#7a1e1e" : "#8a7e6e", letterSpacing: 0.5 }}>
                                  WS{w.ws} S{w.s} AP{w.ap} I{w.i} A{w.a}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <NumberInput label="WS" value={chargerWS} onChange={setChargerWS} min={1} max={10} />
                      <NumberInput label="S" value={chargerS_melee} onChange={setChargerS_melee} min={1} max={10} />
                      <SelectInput label="AP" value={chargerAP_melee} onChange={setChargerAP_melee} options={apOptions} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <NumberInput label="I" value={chargerI} onChange={setChargerI} min={1} max={10} />
                      <NumberInput label="A" value={chargerA} onChange={setChargerA} min={1} max={10} />
                      <NumberInput label="W" value={chargerW_melee} onChange={setChargerW_melee} min={1} max={10} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <NumberInput label="T" value={chargerT_melee} onChange={setChargerT_melee} min={1} max={10} />
                      <SelectInput label="Sv" value={chargerSv} onChange={setChargerSv} options={saveOptions} />
                      <SelectInput label="Inv" value={chargerInvSv} onChange={setChargerInvSv} options={saveOptions} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 4 }}>MELEE RULES</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {MELEE_SPECIAL_RULES.map(r => (
                          <ToggleChip key={r.id} active={chargerMeleeRules[r.id]} label={r.label} desc={r.desc}
                            onClick={() => setChargerMeleeRules(prev => ({ ...prev, [r.id]: !prev[r.id] }))} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Defender Melee */}
                  <div style={{
                    padding: 12, borderRadius: 6,
                    background: "rgba(42,111,180,0.05)", border: "1px solid rgba(42,111,180,0.15)"
                  }}>
                    <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#2a6fb4", letterSpacing: 1.5, marginBottom: 8 }}>
                      🛡 DEFENDER MELEE PROFILE
                    </div>
                    {/* Defender Melee Weapon Selector */}
                    {defenderMeleeWeapons.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 4 }}>MELEE WEAPON</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {defenderMeleeWeapons.map(w => {
                            const active = selectedDefenderMelee?.name === w.name;
                            return (
                              <button key={w.name} onClick={() => applyDefenderMelee(w)} style={{
                                padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                                fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                                background: active ? "rgba(42,111,180,0.15)" : "#f0ebe2",
                                border: `1.5px solid ${active ? "#2a6fb4" : "#d0c4aa"}`,
                                color: active ? "#2a6fb4" : "#6a5e4e",
                                transition: "all 0.15s ease", textAlign: "left",
                                display: "flex", flexDirection: "column", gap: 1, minWidth: 100,
                              }}>
                                <div style={{ fontWeight: 600, fontSize: 11 }}>{w.name}</div>
                                <div style={{ fontSize: 8, color: active ? "#1a4f80" : "#8a7e6e", letterSpacing: 0.5 }}>
                                  WS{w.ws} S{w.s} AP{w.ap} I{w.i} A{w.a}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <NumberInput label="WS" value={defenderWS} onChange={setDefenderWS} min={1} max={10} />
                      <NumberInput label="S" value={defenderS_melee} onChange={setDefenderS_melee} min={1} max={10} />
                      <SelectInput label="AP" value={defenderAP_melee} onChange={setDefenderAP_melee} options={apOptions} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <NumberInput label="I" value={defenderI} onChange={setDefenderI} min={1} max={10} />
                      <NumberInput label="A" value={defenderA} onChange={setDefenderA} min={1} max={10} />
                      <NumberInput label="W" value={defenderW_melee} onChange={setDefenderW_melee} min={1} max={10} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 4 }}>MELEE RULES</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {MELEE_SPECIAL_RULES.map(r => (
                          <ToggleChip key={r.id} active={defenderMeleeRules[r.id]} label={r.label} desc={r.desc}
                            onClick={() => setDefenderMeleeRules(prev => ({ ...prev, [r.id]: !prev[r.id] }))} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolve Charge Button */}
                <button onClick={handleChargeResolve} style={{
                  width: "100%", padding: "14px 24px", fontSize: 15, fontFamily: "'Cinzel', serif", fontWeight: 700,
                  letterSpacing: 2, background: "linear-gradient(180deg, #b83333 0%, #8b1a1a 100%)",
                  border: "none", borderRadius: 6, color: "#fff", cursor: "pointer",
                  textTransform: "uppercase", boxShadow: "0 2px 12px rgba(155,45,45,0.3)",
                  marginBottom: chargeResult ? 16 : 0
                }}>
                  🏃 RESOLVE CHARGE
                </button>

                {/* Charge Results */}
                {chargeResult && (
                  <div style={{ animation: "fadeIn 0.3s ease", marginTop: 16 }}>
                    {/* Charge Result Summary */}
                    <div style={{
                      display: "flex", gap: 12, alignItems: "center", justifyContent: "center",
                      padding: "12px 20px", borderRadius: 8, marginBottom: 14,
                      background: chargeResult.chargeSucceeded ? "rgba(46,125,50,0.08)" : "rgba(199,48,48,0.08)",
                      border: `2px solid ${chargeResult.chargeSucceeded ? "#2e7d32" : "#c74040"}`
                    }}>
                      <span style={{ fontSize: 28 }}>{chargeResult.chargeSucceeded ? "⚔" : "❌"}</span>
                      <div style={{ textAlign: "center" }}>
                        <div style={{
                          fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 18, letterSpacing: 2,
                          color: chargeResult.chargeSucceeded ? "#2e7d32" : "#c74040"
                        }}>
                          {chargeResult.chargeSucceeded ? "CHARGE SUCCEEDED" : "CHARGE FAILED"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6a5e4e", fontFamily: "'EB Garamond', serif", marginTop: 2 }}>
                          Rolled {chargeResult.chargeRoll}" — Needed {chargeDistance}"
                        </div>
                      </div>
                    </div>

                    {/* Stats Summary */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", justifyContent: "center" }}>
                      {chargeResult.volleyCasualties > 0 && (
                        <MiniStat label="Volley Kills" value={chargeResult.volleyCasualties} color="#6b8e23" />
                      )}
                      {chargeResult.overwatchCasualties > 0 && (
                        <MiniStat label="Overwatch Kills" value={chargeResult.overwatchCasualties} color="#c46a1b" />
                      )}
                      <MiniStat label="Charge Roll" value={`${chargeResult.chargeRoll}"`} color={chargeResult.chargeSucceeded ? "#2e7d32" : "#c74040"} />
                      {chargeResult.chargeSucceeded && (
                        <>
                          <MiniStat label="Defender Slain" value={chargeResult.meleeDefenderCasualties} color="#9b2d2d" />
                          <MiniStat label="Charger Slain" value={chargeResult.meleeAttackerCasualties} color="#2a6fb4" />
                          {chargeResult.combatResult && (
                            <MiniStat 
                              label="Combat Winner" 
                              value={chargeResult.combatResult.winner}
                              color={chargeResult.combatResult.winner === "Charger" ? "#9b2d2d" : chargeResult.combatResult.winner === "Defender" ? "#2a6fb4" : "#8a7e6e"} 
                            />
                          )}
                        </>
                      )}
                    </div>

                    {/* Dice Displays */}
                    {chargeResult.rolls.volley && chargeResult.rolls.volley.hit.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#6b8e23", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>VOLLEY FIRE</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {chargeResult.rolls.volley.hit.map((d, i) => <DieIcon key={`vh${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                    {chargeResult.rolls.charge.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#6a5e4e", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>CHARGE ROLL</div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {chargeResult.rolls.charge.map((v, i) => <DieIcon key={i} value={v} success={true} small />)}
                        </div>
                      </div>
                    )}
                    {chargeResult.rolls.overwatch.hit.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#c46a1b", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>OVERWATCH ROLLS</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                          {chargeResult.rolls.overwatch.hit.map((r, i) => <DieIcon key={i} value={r.value} success={r.success} small />)}
                        </div>
                      </div>
                    )}
                    {chargeResult.rolls.melee.hit.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#9b2d2d", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>CHARGER MELEE ROLLS</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                          {chargeResult.rolls.melee.hit.map((r, i) => <DieIcon key={i} value={r.value} success={r.success} small />)}
                        </div>
                      </div>
                    )}
                    {chargeResult.rolls.defender.hit.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#2a6fb4", marginBottom: 4, fontFamily: "'Cinzel', serif" }}>DEFENDER MELEE ROLLS</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                          {chargeResult.rolls.defender.hit.map((r, i) => <DieIcon key={i} value={r.value} success={r.success} small />)}
                        </div>
                      </div>
                    )}

                    {/* Detailed Charge Log */}
                    <div style={{ borderTop: "1px solid #d0c4aa", paddingTop: 12, marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "#8a7e6e", marginBottom: 8, fontFamily: "'Cinzel', serif" }}>CHARGE LOG</div>
                      {chargeResult.log.map((entry, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4, fontSize: 13 }}>
                          <span style={{ color: phaseColors[entry.phase] || "#6a6a6a", minWidth: 16, textAlign: "center" }}>{phaseIcons[entry.phase] || "•"}</span>
                          <span style={{ color: phaseColors[entry.phase] || "#6a6a6a", minWidth: 80, fontFamily: "'Cinzel', serif", fontSize: 10, lineHeight: "20px", textTransform: "uppercase" }}>{entry.phase}</span>
                          <span style={{ color: "#4a4030" }}>{entry.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {history.length > 1 && (
          <div style={{ ...panelStyle }}>
            <div style={panelHeaderStyle}>
              <span style={{ color: "#8a7e6e", fontSize: 16 }}>📜</span>
              <span>ROLL HISTORY</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {history.map((h, i) => (
                <div key={h.timestamp} style={{
                  padding: "6px 12px", borderRadius: 4, fontSize: 12,
                  background: i === 0 ? "rgba(184,134,11,0.1)" : "#f0ebe2",
                  border: `1px solid ${i === 0 ? "#c0b498" : "#f0ebe2"}`,
                  fontFamily: "'Cinzel', serif", color: "#6a5e4e"
                }}>
                  {h.totalShots}→{h.hits}→{h.wounds}→<span style={{ color: h.casualties > 0 ? "#c73030" : "#2e7d32", fontWeight: 600 }}>{h.casualties}☠</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REFERENCE TABLES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}><span>📊</span><span>TO HIT TABLE</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, fontSize: 12 }}>
              {[1,2,3,4,5].map(bsVal => (
                <div key={bsVal} style={{ textAlign: "center", padding: 4, background: bs === bsVal ? "rgba(184,134,11,0.2)" : "transparent", borderRadius: 3 }}>
                  <div style={{ color: "#8a7e6e", fontSize: 10, fontFamily: "'Cinzel', serif" }}>BS{bsVal}</div>
                  <div style={{ color: "#b8860b", fontWeight: 600 }}>{BS_TO_HIT[bsVal]}+</div>
                </div>
              ))}
            </div>
          </div>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}><span>📊</span><span>TO WOUND TABLE</span></div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  <td style={refCellStyle}></td>
                  {[1,2,3,4,5,6,7,8].map(t2 => <td key={t2} style={{ ...refCellStyle, color: toughness === t2 ? "#2a6fb4" : "#8a7e6e" }}>T{t2}</td>)}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5,6,7,8].map(s2 => (
                  <tr key={s2}>
                    <td style={{ ...refCellStyle, color: strength === s2 ? "#b8860b" : "#8a7e6e" }}>S{s2}</td>
                    {[1,2,3,4,5,6,7,8].map(t2 => {
                      const wr = getWoundRoll(s2, t2);
                      const active = strength === s2 && toughness === t2;
                      return (
                        <td key={t2} style={{
                          ...refCellStyle,
                          background: active ? "rgba(184,134,11,0.25)" : "transparent",
                          color: wr === null ? "#d0c0b0" : active ? "#2a2418" : "#8a7e6e",
                          fontWeight: active ? 700 : 400
                        }}>{wr ? `${wr}+` : "–"}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        </>)}

        {/* ━━━━━━━━━━━ ASSAULT PHASE ━━━━━━━━━━━ */}
        {activePhase === "assault" && (<>
          {/* Tactical Map */}
          {deployedUnits.length > 0 && renderTacticalMap({
            refObj: assaultMapRef,
            phase: "assault",
            onUnitClick: (unit) => {
              if (!mapAttackerId) { handleMapAttackerSelect(unit); }
              else if (!mapTargetId && unit.id !== mapAttackerId) { handleMapTargetSelect(unit); }
              else if (unit.id === mapAttackerId) { setMapAttackerId(null); setMapTargetId(null); }
              else { handleMapTargetSelect(unit); }
            },
          })}
          {/* Assault Map Action Bar */}
          {mapAttackerId && mapTargetId && (
            <div style={{ ...panelStyle, marginBottom: 12, display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 14px", alignItems: "center" }}>
              <button onClick={() => {
                const atkU = deployedUnits.find(u => u.id === mapAttackerId);
                const defU = deployedUnits.find(u => u.id === mapTargetId);
                if (atkU && defU) applyChargeMovement({ chargeSucceeded: true });
              }} style={{
                padding: "6px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: "rgba(155,45,45,0.1)", border: "1.5px solid #9b2d2d", color: "#9b2d2d",
              }}>⚔ CHARGE INTO CONTACT</button>
              <button onClick={() => routUnit(mapTargetId)} style={{
                padding: "6px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: "rgba(200,50,50,0.08)", border: "1.5px solid #c74040", color: "#c74040",
              }}>💨 ROUTE TARGET</button>
              <button onClick={() => routUnit(mapAttackerId)} style={{
                padding: "6px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: "rgba(100,100,200,0.08)", border: "1.5px solid #6666aa", color: "#6666aa",
              }}>💨 ROUTE CHARGER</button>
              {routedUnits.size > 0 && (
                <button onClick={() => setRoutedUnits(new Set())} style={{
                  padding: "6px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                  fontFamily: "'Cinzel', serif", fontWeight: 600,
                  background: "#f0ebe2", border: "1.5px solid #d0c4aa", color: "#8a7e6e",
                }}>CLEAR ROUTS</button>
              )}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 9, fontFamily: "'EB Garamond', serif", color: "#8a7e6e", fontStyle: "italic" }}>
                Map selection auto-fills attacker & defender stats below
              </span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
            {/* ATTACKER & DEFENDER — stacked, same style as shooting */}
            {["attacker", "defender"].map(side => {
              const isAtk = side === "attacker";
              const unit = isAtk ? aUnit : dUnit;
              const showPresets = isAtk ? aShowPresets : dShowPresets;
              const setShowPresets = isAtk ? setAShowPresets : setDShowPresets;
              const meleeWeapons = isAtk ? aMeleeWeapons : dMeleeWeapons;
              const selectedMelee = isAtk ? aSelectedMelee : dSelectedMelee;
              const sColor = isAtk ? "#9b2d2d" : "#2a6fb4";
              const sIcon = isAtk ? "⚔" : "🛡";
              const sLabel = isAtk ? "ATTACKING UNIT" : "DEFENDING UNIT";
              const models = isAtk ? aModels : dModels;
              const setModelsF = isAtk ? setAModels : setDModels;
              const ws = isAtk ? aWS : dWS; const setWsF = isAtk ? setAWS : setDWS;
              const sV = isAtk ? aS : dS; const setSF = isAtk ? setAS : setDS;
              const apV = isAtk ? aAP : dAP; const setApF = isAtk ? setAAP : setDAP;
              const iV = isAtk ? aI : dI; const setIF = isAtk ? setAI : setDI;
              const aV = isAtk ? aA : dA; const setAF = isAtk ? setAA : setDA;
              const wV = isAtk ? aW : dW; const setWF = isAtk ? setAW : setDW;
              const tV = isAtk ? aT : dT; const setTF = isAtk ? setAT : setDT;
              const svV = isAtk ? aSv : dSv; const setSvF = isAtk ? setASv : setDSv;
              const invV = isAtk ? aInv : dInv; const setInvF = isAtk ? setAInv : setDInv;
              const fnpV = isAtk ? aFnp : dFnp; const setFnpF = isAtk ? setAFnp : setDFnp;
              const rules = isAtk ? aRules : dRules; const setRulesF = isAtk ? setARules : setDRules;
              const rgbAccent = isAtk ? "155,45,45" : "42,111,180";

              return (
                <div key={side} style={panelStyle}>
                  <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: sColor, fontSize: 16 }}>{sIcon}</span>
                      <span style={{ color: sColor }}>{sLabel}</span>
                    </div>
                  </div>

                  {/* Unit Display / Select Button — matches shooting style */}
                  <div style={{ marginBottom: 14 }}>
                    {unit ? (
                      <button onClick={() => setShowPresets(true)} style={{
                        display: "flex", alignItems: "center", gap: 12, width: "100%",
                        padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                        background: `rgba(${rgbAccent},0.06)`, border: `1.5px solid ${sColor}`,
                        transition: "all 0.15s ease", textAlign: "left"
                      }}>
                        <UnitIcon type={getUnitIconType(unit.name)} size={40} color={sColor} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "#2a2418" }}>{unit.name}</div>
                          <div style={{ fontSize: 10, color: "#8a7e6e", fontFamily: "'Cinzel', serif" }}>
                            {models} model{models > 1 ? "s" : ""} · WS{ws} · I{iV} · A{aV}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: sColor, fontFamily: "'Cinzel', serif" }}>CHANGE ▸</span>
                      </button>
                    ) : (
                      <button onClick={() => setShowPresets(true)} style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        width: "100%", padding: "14px", borderRadius: 8, cursor: "pointer",
                        background: "#f9f6f0", border: "1.5px dashed #c0b498",
                        color: "#8a7e6e", fontFamily: "'Cinzel', serif", fontSize: 12,
                        letterSpacing: 1, transition: "all 0.15s ease"
                      }}>
                        <span style={{ fontSize: 18 }}>+</span> SELECT UNIT
                      </button>
                    )}
                  </div>

                  {/* Unit Selector Modal — same component as shooting phase */}
                  {showPresets && (
                    <UnitSelectorModal
                      presets={meleeUnitRoster}
                      selectedId={unit?.id}
                      title={`SELECT ${isAtk ? "ATTACKING" : "DEFENDING"} UNIT`}
                      accentColor={sColor}
                      onClose={() => setShowPresets(false)}
                      onSelect={u => applyAssaultUnit(u, side)}
                    />
                  )}

                  {/* Melee Weapon Selector — styled like shooting WeaponSelector */}
                  {unit && meleeWeapons.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: 11, color: "#6a5e4e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>Melee Weapon</label>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {meleeWeapons.map(w => {
                            const active = selectedMelee?.name === w.name;
                            return (
                              <button key={w.name} onClick={() => applyAssaultMelee(w, side)} style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                                borderRadius: 8, cursor: "pointer", transition: "all 0.15s ease",
                                background: active ? `rgba(${rgbAccent},0.10)` : "#f9f6f0",
                                border: `1.5px solid ${active ? sColor : "#e0dbd0"}`,
                                boxShadow: active ? `0 2px 8px rgba(${rgbAccent},0.12)` : "none"
                              }}>
                                <div style={{ textAlign: "left" }}>
                                  <div style={{ fontSize: 12, fontFamily: "'Cinzel', serif", fontWeight: 600, color: active ? sColor : "#4a4030" }}>{w.name}</div>
                                  <div style={{ fontSize: 9, color: "#8a7e6e", fontFamily: "'Cinzel', serif", marginTop: 1 }}>
                                    WS{w.ws} S{w.s} AP{w.ap} I{w.i} A{w.a}
                                    {Object.keys(w.rules || {}).filter(r => w.rules[r]).length > 0 && (
                                      <span style={{ color: sColor, marginLeft: 4 }}>
                                        {Object.keys(w.rules).filter(r => w.rules[r]).map(r => MELEE_SPECIAL_RULES.find(sr => sr.id === r)?.label || r).join(", ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected weapon summary bar */}
                  {selectedMelee && (
                    <div style={{
                      marginBottom: 14, padding: "8px 12px", borderRadius: 6,
                      background: `rgba(${rgbAccent},0.06)`, border: "1px solid #e0dbd0",
                      fontSize: 12, color: "#4a4030", fontFamily: "'EB Garamond', serif",
                      display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center"
                    }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: sColor }}>{selectedMelee.name}</span>
                      <span>WS{ws}</span> <span>S{sV}</span> <span>AP{apV}</span>
                      <span>I{iV}</span> <span>A{aV}</span>
                    </div>
                  )}

                  {/* Stats Grid — 3 column layout matching shooting */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <NumberInput label="Models" value={models} onChange={setModelsF} min={1} max={40} />
                    <NumberInput label="WS" value={ws} onChange={setWsF} min={1} max={10} />
                    <NumberInput label="S" value={sV} onChange={setSF} min={1} max={20} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <SelectInput label="AP" value={apV} onChange={setApF} options={apOptions} />
                    <NumberInput label="I" value={iV} onChange={setIF} min={1} max={10} />
                    <NumberInput label="A" value={aV} onChange={setAF} min={1} max={10} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <NumberInput label="W" value={wV} onChange={setWF} min={1} max={10} />
                    <NumberInput label="T" value={tV} onChange={setTF} min={1} max={10} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <SelectInput label="Sv" value={svV} onChange={setSvF} options={saveOptions} />
                    <SelectInput label="Inv" value={invV} onChange={setInvF} options={saveOptions} />
                    <SelectInput label="FNP" value={fnpV} onChange={setFnpF} options={saveOptions} />
                  </div>

                  {/* Special Rules — same toggle style */}
                  <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1, marginBottom: 4 }}>SPECIAL RULES</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {MELEE_SPECIAL_RULES.map(rule => {
                      const active = rules[rule.id];
                      return (
                        <button key={rule.id} onClick={() => setRulesF(prev => ({ ...prev, [rule.id]: !prev[rule.id] }))} style={{
                          padding: "3px 8px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                          fontFamily: "'Cinzel', serif",
                          background: active ? `rgba(${rgbAccent},0.12)` : "#f0ebe2",
                          border: `1px solid ${active ? sColor : "#d0c4aa"}`,
                          color: active ? sColor : "#8a7e6e", fontWeight: active ? 700 : 400,
                        }}>
                          {rule.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charge Options */}
          <div style={{ ...panelStyle, marginBottom: 16, display: "flex", gap: 16, alignItems: "center", justifyContent: "center" }}>
            <CheckToggle checked={assaultCharging} label="Charging (+1A)" onChange={setAssaultCharging} />
            <CheckToggle checked={assaultDisordered} label="Disordered Charge" onChange={setAssaultDisordered} />
          </div>

          {/* ━━━ CHALLENGE SUB-PHASE ━━━ */}
          <div style={{ ...panelStyle, marginBottom: 16, borderColor: challengeEnabled ? "#8b008b" : "#d0c4aa", transition: "border-color 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: challengeEnabled ? 14 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>👑</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: "#8b008b", letterSpacing: 2 }}>CHALLENGE SUB-PHASE</span>
              </div>
              <button onClick={() => { setChallengeEnabled(!challengeEnabled); setChallengeResult(null); }} style={{
                padding: "5px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: challengeEnabled ? "rgba(139,0,139,0.12)" : "#f0ebe2",
                border: `1.5px solid ${challengeEnabled ? "#8b008b" : "#d0c4aa"}`,
                color: challengeEnabled ? "#8b008b" : "#8a7e6e",
              }}>
                {challengeEnabled ? "COLLAPSE ▴" : "ISSUE CHALLENGE ▾"}
              </button>
            </div>

            {challengeEnabled && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: 11, color: "#6a5e4e", fontFamily: "'EB Garamond', serif", marginBottom: 12, fontStyle: "italic" }}>
                  Champions with Command or Champion sub-type step forward for a duel. Each selects a Gambit, then rolls for Focus to determine strike order.
                </div>

                {/* Gambit Selection — Side by Side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  {[
                    { label: "ATTACKER GAMBIT", val: atkGambit, set: setAtkGambit, col: "#9b2d2d" },
                    { label: "DEFENDER GAMBIT", val: defGambit, set: setDefGambit, col: "#2a6fb4" },
                  ].map(side => (
                    <div key={side.label}>
                      <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: side.col, letterSpacing: 1, marginBottom: 4 }}>{side.label}</div>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {CHALLENGE_GAMBITS.map(g => {
                          const active = side.val === g.id;
                          return (
                            <button key={g.id} onClick={() => side.set(g.id)} title={g.desc} style={{
                              padding: "3px 7px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                              fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                              background: active ? "rgba(139,0,139,0.12)" : "#f8f4ec",
                              border: `1px solid ${active ? "#8b008b" : "#e0d8c8"}`,
                              color: active ? "#8b008b" : "#6a5e4e",
                            }}>
                              {g.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gambit Descriptions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  {[
                    { g: CHALLENGE_GAMBITS.find(g => g.id === atkGambit), col: "#9b2d2d" },
                    { g: CHALLENGE_GAMBITS.find(g => g.id === defGambit), col: "#2a6fb4" },
                  ].map((s, i) => s.g && s.g.id !== "none" ? (
                    <div key={i} style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(139,0,139,0.04)", border: "1px solid rgba(139,0,139,0.15)", fontSize: 10, color: "#6a5e4e", fontFamily: "'EB Garamond', serif" }}>
                      <span style={{ fontWeight: 700, color: "#8b008b" }}>{s.g.name}:</span> {s.g.desc}
                    </div>
                  ) : <div key={i} />)}
                </div>

                {/* Support Models */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <NumberInput label="Atk Support Models" value={atkSupport} onChange={setAtkSupport} min={0} max={40} />
                  <NumberInput label="Def Support Models" value={defSupport} onChange={setDefSupport} min={0} max={40} />
                </div>

                {/* Resolve Challenge Button */}
                <button onClick={handleChallengeResolve} style={{
                  width: "100%", padding: "12px 20px", fontSize: 14, fontFamily: "'Cinzel', serif", fontWeight: 700,
                  letterSpacing: 3, background: "linear-gradient(180deg, #a020a0 0%, #6b106b 100%)",
                  border: "none", borderRadius: 8, color: "#fff", cursor: "pointer",
                  textTransform: "uppercase", boxShadow: "0 2px 12px rgba(139,0,139,0.3)", marginBottom: 12,
                }}>
                  👑 RESOLVE CHALLENGE 👑
                </button>

                {/* Challenge Results */}
                {challengeResult && (
                  <div style={{ animation: "fadeIn 0.3s ease" }}>
                    {/* Result Banner */}
                    <div style={{
                      padding: "14px 20px", borderRadius: 8, marginBottom: 12, textAlign: "center",
                      background: challengeResult.result.winner === "Attacker" ? "rgba(155,45,45,0.08)"
                        : challengeResult.result.winner === "Defender" ? "rgba(42,111,180,0.08)"
                        : "rgba(139,0,139,0.06)",
                      border: `2px solid ${challengeResult.result.winner === "Attacker" ? "#9b2d2d" : challengeResult.result.winner === "Defender" ? "#2a6fb4" : "#8b008b"}`
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>
                        {challengeResult.atkSlain && challengeResult.defSlain ? "💀💀" : challengeResult.defSlain ? "⚔" : challengeResult.atkSlain ? "🛡" : "👑"}
                      </div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 16, letterSpacing: 2, color: "#8b008b" }}>
                        {challengeResult.result.winner === "Mutual Kill" ? "MUTUAL DESTRUCTION"
                          : challengeResult.defSlain || challengeResult.atkSlain ? `${challengeResult.result.slain || ""} SLAIN!`
                          : `ROUND: ${challengeResult.result.winner} AHEAD`}
                      </div>
                      <div style={{ fontSize: 11, color: "#6a5e4e", fontFamily: "'EB Garamond', serif", marginTop: 4 }}>
                        Focus: {challengeResult.focusWinner} struck first •
                        Gambits: {challengeResult.atkGambitData.name} vs {challengeResult.defGambitData.name}
                      </div>
                    </div>

                    {/* Wound Trackers */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                      <MiniStat label="Atk Wounds" value={`${challengeResult.atkWoundsRemaining}/${aW}`} color={challengeResult.atkSlain ? "#c74040" : "#2a5e2a"} />
                      <MiniStat label="Def Wounds" value={`${challengeResult.defWoundsRemaining}/${dW}`} color={challengeResult.defSlain ? "#c74040" : "#2a5e2a"} />
                      <MiniStat label="Atk Dealt" value={challengeResult.atkWoundsDealt} color="#9b2d2d" />
                      <MiniStat label="Def Dealt" value={challengeResult.defWoundsDealt} color="#2a6fb4" />
                    </div>

                    {/* Dice Visualization */}
                    {["attacker", "defender"].map(rk => {
                      const r = challengeResult.rolls[rk];
                      const label = rk === "attacker" ? "ATTACKER" : "DEFENDER";
                      const col = rk === "attacker" ? "#9b2d2d" : "#2a6fb4";
                      return (
                        <div key={rk} style={{ marginBottom: 8 }}>
                          {r.focus.length > 0 && (
                            <div style={{ marginBottom: 4 }}>
                              <div style={{ fontSize: 10, color: "#8b008b", marginBottom: 2, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — FOCUS</div>
                              <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                {r.focus.map((d, i) => <DieIcon key={`${rk}fo${i}`} value={d.value} success={d.success} small />)}
                              </div>
                            </div>
                          )}
                          {r.hit.length > 0 && (
                            <div style={{ marginBottom: 4 }}>
                              <div style={{ fontSize: 10, color: col, marginBottom: 2, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — TO HIT</div>
                              <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                {r.hit.map((d, i) => <DieIcon key={`${rk}ch${i}`} value={d.value} success={d.success} small />)}
                              </div>
                            </div>
                          )}
                          {r.wound.length > 0 && (
                            <div style={{ marginBottom: 4 }}>
                              <div style={{ fontSize: 10, color: col, marginBottom: 2, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — TO WOUND</div>
                              <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                {r.wound.map((d, i) => <DieIcon key={`${rk}cw${i}`} value={d.value} success={d.success} small />)}
                              </div>
                            </div>
                          )}
                          {r.save.length > 0 && (
                            <div style={{ marginBottom: 4 }}>
                              <div style={{ fontSize: 10, color: col, marginBottom: 2, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — SAVES</div>
                              <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                {r.save.map((d, i) => <DieIcon key={`${rk}cs${i}`} value={d.value} success={d.success} small />)}
                              </div>
                            </div>
                          )}
                          {r.fnp.length > 0 && (
                            <div style={{ marginBottom: 4 }}>
                              <div style={{ fontSize: 10, color: col, marginBottom: 2, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — FNP</div>
                              <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                {r.fnp.map((d, i) => <DieIcon key={`${rk}cf${i}`} value={d.value} success={d.success} small />)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Challenge Log */}
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: "#8b008b", letterSpacing: 1, marginBottom: 4 }}>CHALLENGE LOG</div>
                      {challengeResult.log.map((entry, i) => (
                        <div key={i} style={{
                          fontSize: 11, padding: "3px 8px", borderRadius: 4, marginBottom: 2,
                          display: "flex", alignItems: "center", gap: 6,
                          background: entry.phase === "Challenge" ? "rgba(139,0,139,0.06)" : entry.phase === "Gambit" ? "rgba(139,0,139,0.04)" : entry.phase === "Focus" ? "rgba(184,134,11,0.05)" : entry.phase === "Strike" ? "rgba(155,45,45,0.04)" : "rgba(0,0,0,0.02)"
                        }}>
                          <span style={{ fontSize: 10 }}>
                            {entry.phase === "Challenge" ? "👑" : entry.phase === "Gambit" ? "🎭" : entry.phase === "Focus" ? "🎯" : entry.phase === "Strike" ? "🗡" : "⚖"}
                          </span>
                          <span style={{ color: entry.phase === "Result" ? "#8b008b" : "#6a5e4e", fontFamily: "'EB Garamond', serif", fontWeight: entry.phase === "Result" ? 600 : 400 }}>{entry.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resolve Button */}
          <button onClick={handleAssaultResolve} style={{
            width: "100%", padding: "16px 24px", fontSize: 16, fontFamily: "'Cinzel', serif", fontWeight: 700,
            letterSpacing: 3, background: "linear-gradient(180deg, #a02020 0%, #7a1515 100%)",
            border: "none", borderRadius: 8, color: "#fff", cursor: "pointer",
            textTransform: "uppercase", boxShadow: "0 2px 16px rgba(155,45,45,0.3)", marginBottom: 16,
          }}>
            🗡 RESOLVE ASSAULT PHASE 🗡
          </button>

          {/* Results */}
          {assaultResult && (
            <div style={{ ...panelStyle, animation: "fadeIn 0.3s ease" }}>
              {/* Summary Banner */}
              <div style={{
                display: "flex", gap: 16, alignItems: "center", justifyContent: "center",
                padding: "14px 20px", borderRadius: 8, marginBottom: 14,
                background: assaultResult.combatResult.winner === "Attacker" ? "rgba(155,45,45,0.08)"
                  : assaultResult.combatResult.winner === "Defender" ? "rgba(42,111,180,0.08)"
                  : "rgba(100,100,100,0.05)",
                border: `2px solid ${assaultResult.combatResult.winner === "Attacker" ? "#9b2d2d" : assaultResult.combatResult.winner === "Defender" ? "#2a6fb4" : "#aaa"}`
              }}>
                <span style={{ fontSize: 28 }}>
                  {assaultResult.combatResult.winner === "Attacker" ? "⚔" : assaultResult.combatResult.winner === "Defender" ? "🛡" : "⚖"}
                </span>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 18, letterSpacing: 2,
                    color: assaultResult.combatResult.winner === "Attacker" ? "#9b2d2d" : assaultResult.combatResult.winner === "Defender" ? "#2a6fb4" : "#6a5e4e"
                  }}>
                    {assaultResult.combatResult.winner === "Draw" ? "COMBAT DRAW" : `${assaultResult.combatResult.winner.toUpperCase()} WINS BY ${assaultResult.combatResult.diff}`}
                  </div>
                  <div style={{ fontSize: 12, color: "#8a7e6e", fontFamily: "'EB Garamond', serif" }}>
                    {assaultResult.remainingAttackers} attacker(s) / {assaultResult.remainingDefenders} defender(s) survive
                  </div>
                </div>
              </div>

              {/* Stat Boxes */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
                <MiniStat label="Atk Killed" value={assaultResult.defenderCasualties} color="#9b2d2d" />
                <MiniStat label="Def Killed" value={assaultResult.attackerCasualties} color="#2a6fb4" />
                <MiniStat label="Atk Survive" value={assaultResult.remainingAttackers} color="#2a5e2a" />
                <MiniStat label="Def Survive" value={assaultResult.remainingDefenders} color="#2a5e2a" />
              </div>

              {/* Dice Displays */}
              {["attacker", "defender"].map(rollKey => {
                const r = assaultResult.rolls[rollKey];
                const label = rollKey === "attacker" ? "ATTACKER" : "DEFENDER";
                const col = rollKey === "attacker" ? "#9b2d2d" : "#2a6fb4";
                return (
                  <div key={rollKey} style={{ marginBottom: 10 }}>
                    {r.hit.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: col, marginBottom: 3, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — TO HIT</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {r.hit.map((d, i) => <DieIcon key={`${rollKey}h${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                    {r.wound.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: col, marginBottom: 3, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — TO WOUND</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {r.wound.map((d, i) => <DieIcon key={`${rollKey}w${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                    {r.save.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: col, marginBottom: 3, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — SAVES</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {r.save.map((d, i) => <DieIcon key={`${rollKey}s${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                    {r.fnp.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: col, marginBottom: 3, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{label} — FNP</div>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {r.fnp.map((d, i) => <DieIcon key={`${rollKey}f${i}`} value={d.value} success={d.success} small />)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Combat Log */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: "#6a5e4e", letterSpacing: 1, marginBottom: 6 }}>COMBAT LOG</div>
                {assaultResult.log.map((entry, i) => (
                  <div key={i} style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 4, marginBottom: 2,
                    display: "flex", alignItems: "center", gap: 6,
                    background: entry.phase === "Melee" ? "rgba(155,45,45,0.04)" : entry.phase === "Combat Res" ? "rgba(184,134,11,0.06)" : "rgba(0,0,0,0.02)"
                  }}>
                    <span style={{ fontSize: 10 }}>{entry.phase === "Melee" ? "🗡" : entry.phase === "Combat Res" ? "⚖" : "•"}</span>
                    <span style={{ color: entry.phase === "Combat Res" ? "#8b6508" : "#6a5e4e", fontFamily: "'EB Garamond', serif" }}>{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>)}

        {/* ━━━━━━━━━━━ END PHASE ━━━━━━━━━━━ */}
        {activePhase === "end" && (<>
          {/* VP Scoreboard */}
          <div style={{ ...panelStyle, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "#2e5e3e", letterSpacing: 2, marginBottom: 12 }}>
              🏛 ROUND {currentRound} — VICTORY SUB-PHASE
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: "#9b2d2d", letterSpacing: 1 }}>PLAYER 1</div>
                <div style={{ fontSize: 36, fontFamily: "'Cinzel', serif", fontWeight: 900, color: "#9b2d2d" }}>{p1TotalVP + calcSecondaryVP(p1Secondaries)}</div>
                <div style={{ fontSize: 9, color: "#8a7e6e" }}>Primary {p1TotalVP} + Secondary {calcSecondaryVP(p1Secondaries)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#c0b498" }}>vs</div>
              <div>
                <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: "#2a6fb4", letterSpacing: 1 }}>PLAYER 2</div>
                <div style={{ fontSize: 36, fontFamily: "'Cinzel', serif", fontWeight: 900, color: "#2a6fb4" }}>{p2TotalVP + calcSecondaryVP(p2Secondaries)}</div>
                <div style={{ fontSize: 9, color: "#8a7e6e" }}>Primary {p2TotalVP} + Secondary {calcSecondaryVP(p2Secondaries)}</div>
              </div>
            </div>
          </div>

          {/* Casualties This Round */}
          <div style={{ ...panelStyle, marginBottom: 16 }}>
            <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#2e5e3e", fontSize: 16 }}>💀</span>
                <span style={{ color: "#2e5e3e" }}>CASUALTIES THIS ROUND</span>
              </div>
              <button onClick={() => setRoundKills([])} style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                background: "rgba(200,50,50,0.08)", border: "1.5px solid #c74040", color: "#c74040",
              }}>
                RESET ✕
              </button>
            </div>

            {roundKills.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", fontSize: 11, color: "#a09888", fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>
                No casualties recorded. Resolve combats in Shooting or Assault phase to track kills here.
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                  <MiniStat label="Total Killed" value={roundKills.reduce((s, k) => s + k.casualties, 0)} color="#c74040" />
                  <MiniStat label="Shooting" value={roundKills.filter(k => k.phase === "Shooting").reduce((s, k) => s + k.casualties, 0)} color="#b8860b" />
                  <MiniStat label="Charge" value={roundKills.filter(k => k.phase === "Charge").reduce((s, k) => s + k.casualties, 0)} color="#c46a1b" />
                  <MiniStat label="Challenge" value={roundKills.filter(k => k.phase === "Challenge").reduce((s, k) => s + k.casualties, 0)} color="#8b008b" />
                  <MiniStat label="Assault" value={roundKills.filter(k => k.phase === "Assault").reduce((s, k) => s + k.casualties, 0)} color="#9b2d2d" />
                </div>

                {/* Kill List */}
                {roundKills.map((kill, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                    borderRadius: 4, marginBottom: 3,
                    background: kill.phase === "Shooting" ? "rgba(184,134,11,0.04)" : kill.phase === "Charge" ? "rgba(196,106,27,0.04)" : kill.phase === "Challenge" ? "rgba(139,0,139,0.04)" : "rgba(155,45,45,0.04)",
                    border: `1px solid ${kill.phase === "Shooting" ? "rgba(184,134,11,0.15)" : kill.phase === "Charge" ? "rgba(196,106,27,0.15)" : kill.phase === "Challenge" ? "rgba(139,0,139,0.15)" : "rgba(155,45,45,0.15)"}`
                  }}>
                    <span style={{
                      fontSize: 8, fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 1,
                      padding: "2px 6px", borderRadius: 3, color: "#fff",
                      background: kill.phase === "Shooting" ? "#b8860b" : kill.phase === "Charge" ? "#c46a1b" : kill.phase === "Challenge" ? "#8b008b" : "#9b2d2d",
                    }}>
                      {kill.phase === "Shooting" ? "SHOOT" : kill.phase === "Charge" ? "CHARGE" : kill.phase === "Challenge" ? "DUEL" : "MELEE"}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "'EB Garamond', serif", color: "#4a4030", flex: 1 }}>
                      {kill.detail}
                    </span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "#c74040" }}>
                      {kill.casualties}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Objectives Panel */}
          <div style={{ ...panelStyle, marginBottom: 16 }}>
            <div style={{ ...panelHeaderStyle, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#2e5e3e", fontSize: 16 }}>🎯</span>
                <span style={{ color: "#2e5e3e" }}>PRIMARY OBJECTIVES</span>
                <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#5b4a8a", letterSpacing: 1,
                  padding: "2px 8px", borderRadius: 3, background: "rgba(91,74,138,0.1)", border: "1px solid rgba(91,74,138,0.25)" }}>
                  {MISSIONS[missionType]?.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {objectiveMarkers.length > 0 && (
                  <button onClick={() => {
                    // Sync objectives from placed markers
                    const sorted = [...objectiveMarkers].sort((a, b) => a.id - b.id);
                    setObjectives(sorted.map((m, i) => ({ id: i + 1, value: m.value, controller: "none", line: 0 })));
                  }} style={{
                    padding: "3px 10px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: 1,
                    background: "rgba(91,74,138,0.10)", border: "1.5px solid #5b4a8a", color: "#5b4a8a",
                  }} title="Sync objective count and VP values from markers placed on the map">
                    ↓ SYNC FROM MAP ({objectiveMarkers.length})
                  </button>
                )}
                <span style={{ fontSize: 10, color: "#8a7e6e", fontFamily: "'Cinzel', serif" }}>Objectives:</span>
                {[2, 3, 4, 5, 6].map(n => (
                  <button key={n} onClick={() => handleNumObjectivesChange(n)} style={{
                    padding: "3px 8px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                    fontFamily: "'Cinzel', serif", fontWeight: numObjectives === n ? 700 : 400,
                    background: numObjectives === n ? "rgba(46,94,62,0.12)" : "#f0ebe2",
                    border: `1px solid ${numObjectives === n ? "#2e5e3e" : "#d0c4aa"}`,
                    color: numObjectives === n ? "#2e5e3e" : "#8a7e6e",
                  }}>{n}</button>
                ))}
              </div>
            </div>

            {objectives.map((obj, idx) => (
              <div key={obj.id} style={{
                display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 10, alignItems: "center",
                padding: "8px 10px", marginBottom: 4, borderRadius: 6,
                background: obj.controller === "p1" ? "rgba(155,45,45,0.05)" : obj.controller === "p2" ? "rgba(42,111,180,0.05)" : "rgba(0,0,0,0.02)"
              }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: "#2e5e3e", minWidth: 50 }}>
                  OBJ {idx + 1}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>Value:</span>
                  {[2, 3].map(v => (
                    <button key={v} onClick={() => updateObjective(idx, "value", v)} style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 10, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontWeight: obj.value === v ? 700 : 400,
                      background: obj.value === v ? "rgba(46,94,62,0.15)" : "#f8f4ec",
                      border: `1px solid ${obj.value === v ? "#2e5e3e" : "#e0d8c8"}`,
                      color: obj.value === v ? "#2e5e3e" : "#8a7e6e",
                    }}>{v}VP</button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>Control:</span>
                  {[
                    { val: "none", label: "—", col: "#8a7e6e" },
                    { val: "p1", label: "P1", col: "#9b2d2d" },
                    { val: "p2", label: "P2", col: "#2a6fb4" },
                  ].map(c => (
                    <button key={c.val} onClick={() => updateObjective(idx, "controller", c.val)} style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 10, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontWeight: obj.controller === c.val ? 700 : 400,
                      background: obj.controller === c.val ? (c.val === "p1" ? "rgba(155,45,45,0.12)" : c.val === "p2" ? "rgba(42,111,180,0.12)" : "#f8f4ec") : "#f8f4ec",
                      border: `1px solid ${obj.controller === c.val ? c.col : "#e0d8c8"}`,
                      color: obj.controller === c.val ? c.col : "#8a7e6e",
                    }}>{c.label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e" }}>Line:</span>
                  {[0, 1, 2, 3].map(l => (
                    <button key={l} onClick={() => updateObjective(idx, "line", l)} style={{
                      padding: "2px 6px", borderRadius: 3, fontSize: 9, cursor: "pointer",
                      fontFamily: "'Cinzel', serif", fontWeight: obj.line === l ? 700 : 400,
                      background: obj.line === l ? "rgba(46,94,62,0.12)" : "#f8f4ec",
                      border: `1px solid ${obj.line === l ? "#2e5e3e" : "#e0d8c8"}`,
                      color: obj.line === l ? "#2e5e3e" : "#8a7e6e",
                    }}>{l === 0 ? "—" : `+${l}`}</button>
                  ))}
                </div>
              </div>
            ))}

            {/* Score Round Button */}
            <button onClick={scoreRound} style={{
              width: "100%", padding: "12px 20px", fontSize: 14, fontFamily: "'Cinzel', serif", fontWeight: 700,
              letterSpacing: 3, background: "linear-gradient(180deg, #3a7a4a 0%, #2e5e3e 100%)",
              border: "none", borderRadius: 8, color: "#fff", cursor: "pointer",
              textTransform: "uppercase", boxShadow: "0 2px 12px rgba(46,94,62,0.3)", marginTop: 12,
            }}>
              🏛 SCORE ROUND {currentRound}
            </button>
          </div>

          {/* Secondary Objectives */}
          <div style={{ ...panelStyle, marginBottom: 16 }}>
            <div style={{ ...panelHeaderStyle }}>
              <span style={{ color: "#2e5e3e", fontSize: 16 }}>🎖</span>
              <span style={{ color: "#2e5e3e" }}>SECONDARY OBJECTIVES</span>
            </div>
            <div style={{ fontSize: 10, color: "#6a5e4e", fontFamily: "'EB Garamond', serif", marginBottom: 10, fontStyle: "italic" }}>
              Set VP values per mission, then check off achieved secondaries for each player.
            </div>

            {/* Secondary VP Values */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[
                { id: "slayWarlord", label: "Slay the Warlord" },
                { id: "giantKiller", label: "Giant Killer" },
                { id: "firstStrike", label: "First Strike" },
                { id: "lastManStanding", label: "Last Man Standing" },
              ].map(sec => (
                <div key={sec.id} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#6a5e4e", letterSpacing: 0.5, marginBottom: 3 }}>{sec.label}</div>
                  <input type="number" value={secondaryValues[sec.id]} min={0} max={10}
                    onChange={e => setSecondaryValues(prev => ({ ...prev, [sec.id]: parseInt(e.target.value) || 0 }))}
                    style={{ width: 40, padding: "4px", textAlign: "center", borderRadius: 4, border: "1px solid #d0c4aa", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 700, color: "#2e5e3e" }}
                  />
                  <div style={{ fontSize: 8, color: "#a09888" }}>VP</div>
                </div>
              ))}
            </div>

            {/* Player Checkboxes */}
            {[
              { label: "PLAYER 1", secondaries: p1Secondaries, set: setP1Secondaries, col: "#9b2d2d" },
              { label: "PLAYER 2", secondaries: p2Secondaries, set: setP2Secondaries, col: "#2a6fb4" },
            ].map(player => (
              <div key={player.label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: player.col, letterSpacing: 1, marginBottom: 4 }}>{player.label}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { id: "slayWarlord", label: "Slay Warlord" },
                    { id: "giantKiller", label: "Giant Killer" },
                    { id: "firstStrike", label: "First Strike" },
                    { id: "lastManStanding", label: "Last Man" },
                  ].map(sec => {
                    const active = player.secondaries[sec.id];
                    return (
                      <button key={sec.id} onClick={() => player.set(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))} style={{
                        padding: "4px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                        fontFamily: "'Cinzel', serif", fontWeight: active ? 700 : 400,
                        background: active ? `rgba(${player.col === "#9b2d2d" ? "155,45,45" : "42,111,180"},0.15)` : "#f8f4ec",
                        border: `1.5px solid ${active ? player.col : "#e0d8c8"}`,
                        color: active ? player.col : "#8a7e6e",
                      }}>
                        {active ? "✓ " : ""}{sec.label}{active ? ` (+${secondaryValues[sec.id]})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Status Recovery */}
          <div style={{ ...panelStyle, marginBottom: 16 }}>
            <div style={{ ...panelHeaderStyle }}>
              <span style={{ color: "#2e5e3e", fontSize: 16 }}>🔄</span>
              <span style={{ color: "#2e5e3e" }}>STATUS RECOVERY</span>
            </div>
            <div style={{ fontSize: 10, color: "#6a5e4e", fontFamily: "'EB Garamond', serif", marginBottom: 10, fontStyle: "italic" }}>
              Units with Tactical Statuses roll 2D6 ≤ Cool/Leadership to recover before scoring.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 8, alignItems: "end", marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1 }}>UNIT NAME</label>
                <input id="statusUnitName" type="text" placeholder="e.g. Tactical Squad" style={{
                  width: "100%", padding: "6px 10px", borderRadius: 4, border: "1px solid #d0c4aa",
                  fontSize: 12, fontFamily: "'EB Garamond', serif", background: "#f9f6f0"
                }} />
              </div>
              <div>
                <label style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1 }}>STAT</label>
                <select id="statusStat" style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid #d0c4aa", fontSize: 11, fontFamily: "'Cinzel', serif", background: "#f9f6f0" }}>
                  <option value="Cool">Cool</option>
                  <option value="Ld">Leadership</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 9, fontFamily: "'Cinzel', serif", color: "#8a7e6e", letterSpacing: 1 }}>VALUE</label>
                <input id="statusStatValue" type="number" defaultValue={8} min={1} max={14} style={{
                  width: 50, padding: "6px", textAlign: "center", borderRadius: 4, border: "1px solid #d0c4aa",
                  fontSize: 12, fontFamily: "'Cinzel', serif", background: "#f9f6f0"
                }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 2 }}>
                <input id="statusNoxVox" type="checkbox" style={{ accentColor: "#2e5e3e" }} />
                <label htmlFor="statusNoxVox" style={{ fontSize: 8, fontFamily: "'Cinzel', serif", color: "#2e5e3e", letterSpacing: 0.5, cursor: "pointer" }}>📡 Nox-Vox</label>
              </div>
              <button onClick={() => {
                const name = document.getElementById("statusUnitName")?.value || "Unit";
                const stat = document.getElementById("statusStat")?.value || "Cool";
                const val = parseInt(document.getElementById("statusStatValue")?.value) || 8;
                const hasNox = document.getElementById("statusNoxVox")?.checked || false;
                rollStatusRecovery(name, stat, val, hasNox);
              }} style={{
                padding: "6px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 1,
                background: "rgba(46,94,62,0.12)", border: "1.5px solid #2e5e3e", color: "#2e5e3e",
              }}>
                ROLL 🎲
              </button>
            </div>

            {/* Recovery Results */}
            {statusRecoveries.filter(r => r.round === currentRound).map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                borderRadius: 4, marginBottom: 3,
                background: r.passed ? "rgba(46,94,62,0.06)" : "rgba(200,50,50,0.06)",
                border: `1px solid ${r.passed ? "rgba(46,94,62,0.2)" : "rgba(200,50,50,0.2)"}`
              }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {r.dice.map((d, j) => <DieIcon key={j} value={d} success={r.passed} small />)}
                </div>
                <span style={{ fontSize: 11, fontFamily: "'EB Garamond', serif", color: r.passed ? "#2e5e3e" : "#c74040" }}>
                  {r.unitName} — {r.stat} {r.statValue}{r.hasNox ? " [Nox-Vox +1]" : ""}: rolled {r.total} → {r.passed ? "RECOVERED ✓" : "STILL AFFLICTED ✗"}
                </span>
              </div>
            ))}
          </div>

          {/* VP History Log */}
          {vpLog.length > 0 && (
            <div style={{ ...panelStyle, marginBottom: 16 }}>
              <div style={{ ...panelHeaderStyle }}>
                <span style={{ color: "#2e5e3e", fontSize: 16 }}>📜</span>
                <span style={{ color: "#2e5e3e" }}>VP HISTORY</span>
              </div>
              {vpLog.map((entry, i) => (
                <div key={i} style={{
                  padding: "8px 12px", borderRadius: 6, marginBottom: 4,
                  background: "rgba(46,94,62,0.03)", border: "1px solid rgba(46,94,62,0.1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: "#2e5e3e" }}>ROUND {entry.round}</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "#9b2d2d" }}>P1: +{entry.p1}</span>
                      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "#2a6fb4" }}>P2: +{entry.p2}</span>
                    </div>
                  </div>
                  {entry.log.map((l, j) => (
                    <div key={j} style={{ fontSize: 10, color: "#6a5e4e", fontFamily: "'EB Garamond', serif", paddingLeft: 8 }}>• {l}</div>
                  ))}
                </div>
              ))}

              {/* Grand Total */}
              <div style={{
                marginTop: 8, padding: "12px 16px", borderRadius: 8, textAlign: "center",
                background: "rgba(46,94,62,0.06)", border: "2px solid #2e5e3e"
              }}>
                <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: "#2e5e3e", letterSpacing: 2, marginBottom: 6 }}>GRAND TOTAL (Primary + Secondary)</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
                  <div>
                    <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 28, color: "#9b2d2d" }}>{p1TotalVP + calcSecondaryVP(p1Secondaries)}</span>
                    <div style={{ fontSize: 9, color: "#9b2d2d", fontFamily: "'Cinzel', serif" }}>PLAYER 1</div>
                  </div>
                  <div>
                    <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 28, color: "#2a6fb4" }}>{p2TotalVP + calcSecondaryVP(p2Secondaries)}</span>
                    <div style={{ fontSize: 9, color: "#2a6fb4", fontFamily: "'Cinzel', serif" }}>PLAYER 2</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>)}

        <div style={{ textAlign: "center", marginTop: 24, padding: 16, color: "#a09888", fontSize: 11, fontFamily: "'Cinzel', serif" }}>
          Rules Reference: Warhammer — The Horus Heresy: Age of Darkness Rulebook (3rd Edition)
          <br />All dice rolls are simulated. Use for quick resolution and statistical analysis.
          <br />Version 1.22 — Equipment: Vexilla, Nox-Vox, Melta Bombs
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "#8a7e6e", fontFamily: "'Cinzel', serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 22, color, fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color = "#2a2418" }) {
  return (
    <div style={{ padding: "4px 10px", background: "#f0ebe2", borderRadius: 4, textAlign: "center" }}>
      <span style={{ fontSize: 10, color: "#8a7e6e", fontFamily: "'Cinzel', serif" }}>{label} </span>
      <span style={{ fontSize: 14, color, fontWeight: 600, fontFamily: "'Cinzel', serif" }}>{value}</span>
    </div>
  );
}

const panelStyle = {
  background: "#ffffff",
  border: "1px solid #d0c4aa",
  borderRadius: 8,
  padding: 16,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
};

const panelHeaderStyle = {
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 12, fontFamily: "'Cinzel', serif", fontWeight: 700,
  color: "#6a5e4e", letterSpacing: 2, textTransform: "uppercase",
  marginBottom: 12,
};

const refCellStyle = {
  padding: "3px 4px", textAlign: "center",
  fontFamily: "'Cinzel', serif", fontSize: 10
};
