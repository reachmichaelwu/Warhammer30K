(function() {
window.HH = window.HH || {};


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
  { id: "breaching3", label: "Breaching (3+)", desc: "To Wound of 3+ improves AP by 2 (minimum 2)" },
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
  { category: "WARLORD", units: [
    { id: "lion", name: "Lion El'Jonson (I)", models: 1, bs: 6, t: 6, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "khan", name: "Jaghatai Khan (V)", models: 1, bs: 5, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "russ", name: "Leman Russ (VI)", models: 1, bs: 5, t: 7, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "dorn", name: "Rogal Dorn (VII)", models: 1, bs: 5, t: 7, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "sanguinius", name: "Sanguinius (IX)", models: 1, bs: 6, t: 6, w: 8, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "ferrus", name: "Ferrus Manus (X)", models: 1, bs: 5, t: 7, w: 8, sv: "2", inv: "3", fnp: "-", ld: 12 },
    { id: "guilliman", name: "Roboute Guilliman (XIII)", models: 1, bs: 6, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
    { id: "vulkan", name: "Vulkan (XVIII)", models: 1, bs: 5, t: 7, w: 9, sv: "2", inv: "3", fnp: "-", ld: 12 },
    { id: "corax", name: "Corvus Corax (XIX)", models: 1, bs: 6, t: 6, w: 7, sv: "2", inv: "4", fnp: "-", ld: 12 },
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
  { category: "HIGH COMMAND", units: [
    { id: "praetor_pa",     name: "Praetor (Power Armour)",   models: 1,  bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "praetor_ta",     name: "Praetor (Terminator)",     models: 1,  bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "praetor_sat",    name: "Praetor (Saturnine)",      models: 1,  bs: 5, t: 5, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
  ]},
  { category: "COMMAND", units: [
    { id: "centurion",      name: "Centurion",                models: 1,  bs: 5, t: 4, w: 3, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "centurion_ta",   name: "Centurion (Terminator)",   models: 1,  bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "champion",       name: "Legion Champion",          models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "master_signals", name: "Master of Signals",        models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "vigilator",      name: "Vigilator",                models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "chaplain",       name: "Legion Chaplain",          models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "librarian",      name: "Legion Librarian",         models: 1,  bs: 4, t: 4, w: 2, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "herald",         name: "Legion Herald",            models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "moritat",        name: "Moritat",                  models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "siege_breaker",  name: "Siege Breaker",            models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "forge_lord",     name: "Forge Lord",               models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "esoterist",      name: "Esoterist",                models: 1,  bs: 4, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "praevian",       name: "Praevian",                 models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "overseer",       name: "Overseer",                 models: 1,  bs: 5, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 9 },
    { id: "optae",          name: "Optae",                    models: 1,  bs: 4, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "damocles_rhino", name: "Damocles Command Rhino",   models: 1,  bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "RETINUE", units: [
    { id: "praetorian_cmd_jp", name: "Praetorian Command Squad (Jump Packs)", models: 5, bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 9 },
    { id: "praetorian_cmd",    name: "Praetorian Command Squad",              models: 5, bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 9 },
    { id: "tartaros_cmd",      name: "Tartaros Terminator Command Squad",     models: 3, bs: 5, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 9 },
    { id: "centurion_cmd",     name: "Centurion Command Squad",               models: 5, bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 9 },
    { id: "cataphractii_cmd",  name: "Cataphractii Terminator Command Squad", models: 3, bs: 5, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 9 },
  ]},
  { category: "ELITES", units: [
    { id: "veteran",        name: "Veteran Tactical Squad",   models: 5,  bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "veteran_assault",name: "Veteran Assault Squad",    models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "seeker",           name: "Seeker Squad",             models: 5,  bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "TROOPS", units: [
    { id: "tactical",         name: "Tactical Squad",           models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "despoiler",        name: "Despoiler Squad",          models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "breacher",         name: "Breacher Squad",           models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "6", fnp: "-", ld: 8 },
    { id: "assault",          name: "Assault Squad",            models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "tactical_support", name: "Tactical Support Squad",   models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "HEAVY ASSAULT", units: [
    { id: "cataphractii", name: "Cataphractii Terminators", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
    { id: "tartaros",     name: "Tartaros Terminators",    models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "saturnine",    name: "Saturnine Terminators",   models: 3, bs: 4, hasSgt: true, t: 6, w: 3, sv: "2", inv: "4", fnp: "-", ld: 8 },
  ]},
  { category: "SUPPORT", units: [
    { id: "heavy_support",    name: "Heavy Support Squad",      models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "rapier_la", name: "Rapier Battery (Legiones)", models: 1, bs: 4, t: 6, w: 3, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "apothecary",     name: "Apothecary",               models: 1,  bs: 4, t: 4, w: 2, sv: "3", inv: "-", fnp: "4", ld: 7 },
    { id: "techmarine",     name: "Techmarine",               models: 1,  bs: 4, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 7 },
    { id: "araknae", name: "Araknae Quad Accelerator", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "WAR ENGINE", units: [
    { id: "contemptor", name: "Contemptor Dreadnought", models: 1, bs: 5, t: 7, w: 7, sv: "2", inv: "5", fnp: "-", ld: 9 },
    { id: "leviathan", name: "Leviathan Dreadnought", models: 1, bs: 5, t: 8, w: 8, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "deredeo", name: "Deredeo Dreadnought", models: 1, bs: 5, t: 7, w: 7, sv: "2", inv: "5", fnp: "-", ld: 9 },
    { id: "saturnine_dread", name: "Saturnine Dreadnought", models: 1, bs: 5, t: 8, w: 9, sv: "2", inv: "5", fnp: "-", ld: 9 },
  ]},
  { category: "TRANSPORT", units: [
    { id: "rhino", name: "Rhino", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "termite", name: "Termite", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "drop_pod", name: "Drop Pod", models: 1, bs: 0, t: 6, w: 4, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "HEAVY TRANSPORT", units: [
    { id: "land_raider", name: "Land Raider Carrier", models: 1, bs: 4, t: 8, w: 8, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "spartan", name: "Spartan", models: 1, bs: 4, t: 8, w: 9, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "dreadnought_drop_pod", name: "Dreadnought Drop Pod", models: 1, bs: 0, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "dreadclaw", name: "Dreadclaw Drop Pod", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "kharybdis", name: "Kharybdis Assault Claw", models: 1, bs: 4, t: 8, w: 7, sv: "2", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "ARMOUR", units: [
    { id: "predator", name: "Predator", models: 1, bs: 4, t: 7, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "sicaran", name: "Sicaran", models: 1, bs: 4, t: 7, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "sicaran_venator", name: "Sicaran Venator", models: 1, bs: 4, t: 7, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "vindicator", name: "Vindicator Siege Tank", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "kratos", name: "Kratos Assault Tank", models: 1, bs: 4, t: 8, w: 8, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "scorpius", name: "Scorpius Missile Tank", models: 1, bs: 4, t: 7, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "arquitor", name: "Arquitor Bombard", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "RECON", units: [
    { id: "recon",            name: "Reconnaissance Squad",     models: 5,  bs: 4, hasSgt: true, t: 4, w: 1, sv: "4", inv: "-", fnp: "-", ld: 8 },
    { id: "sabre", name: "Sabre", models: 1, bs: 4, t: 6, w: 4, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "outrider", name: "Outrider Squadron", models: 3, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "land_raider_exp", name: "Land Raider Explorator", models: 1, bs: 4, t: 8, w: 8, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "tarantula", name: "Tarantula Battery", models: 2, bs: 3, t: 5, w: 2, sv: "3", inv: "-", fnp: "-", ld: 5 },
  ]},
  { category: "FAST ATTACK", units: [
    { id: "xiphon", name: "Xiphon Interceptor", models: 1, bs: 4, t: 7, w: 5, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "storm_eagle", name: "Storm Eagle", models: 1, bs: 4, t: 8, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "fire_raptor", name: "Fire Raptor", models: 1, bs: 4, t: 8, w: 6, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "scimitar_jetbike", name: "Scimitar Jetbike Squadron", models: 3, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 7 },
    { id: "javelin", name: "Javelin Squadron", models: 1, bs: 4, t: 6, w: 4, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "land_speeder", name: "Land Speeder Squadron", models: 1, bs: 4, t: 5, w: 3, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "LORD OF WAR", units: [
    { id: "cerberus", name: "Cerberus Heavy Tank Destroyer", models: 1, bs: 4, t: 9, w: 12, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "typhon", name: "Typhon Heavy Siege Tank", models: 1, bs: 4, t: 9, w: 12, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "glaive", name: "Glaive Super-Heavy", models: 1, bs: 4, t: 9, w: 14, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "fellblade", name: "Fellblade Super-Heavy", models: 1, bs: 4, t: 9, w: 14, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "falchion", name: "Falchion Super-Heavy", models: 1, bs: 4, t: 9, w: 14, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "thunderhawk", name: "Thunderhawk Gunship", models: 1, bs: 4, t: 9, w: 14, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "daemon_greater", name: "Greater Daemon", models: 1, bs: 5, t: 6, w: 6, sv: "-", inv: "4", fnp: "-", ld: 9 },
  ]},
  { category: "DAEMONS", units: [
    { id: "daemon_lesser", name: "Lesser Daemon", models: 10, bs: 3, t: 4, w: 1, sv: "-", inv: "5", fnp: "-", ld: 7 },
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
  // ── LEGION-SPECIFIC NAMED CHARACTERS ──
  { category: "I: DARK ANGELS", units: [
    { id: "corswain",       name: "Corswain (I - High Cmd)",       models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "marduk_sedras",  name: "Marduk Sedras (I - High Cmd)",  models: 1, bs: 5, t: 5, w: 5, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "deathwing_comp", name: "Deathwing Companion (I - Elite)", models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "dreadwing_inter",name: "Dreadwing Interemptor (I - Troops)", models: 5, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "inner_circle_knight", name: "Inner Circle Knight Cenobite (I - Elite)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
  ]},
  { category: "III: EMPEROR'S CHILDREN", units: [
    { id: "eidolon",        name: "Lord Cdr Eidolon (III - High Cmd)", models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "lucius",         name: "Captain Lucius (III - Cmd)",        models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "saul_tarvitz",   name: "Saul Tarvitz (III - Cmd)",          models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "phoenix_term",   name: "Phoenix Terminator (III - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "palatine_blade", name: "Palatine Blade (III - Elite)",      models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "kakophoni",      name: "Kakophoni (III - Support)",         models: 5, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 9 },
  ]},
  { category: "IV: IRON WARRIORS", units: [
    { id: "warsmith",       name: "Warsmith (IV - High Cmd)",          models: 1, bs: 5, t: 5, w: 5, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "tyrant_siege_term", name: "Tyrant Siege Terminator (IV - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
    { id: "domitar_ferrum", name: "Domitar-Ferrum Iron Circle (IV - War Engine)", models: 1, bs: 4, t: 7, w: 4, sv: "2", inv: "5", fnp: "-", ld: 8 },
  ]},
  { category: "V: WHITE SCARS", units: [
    { id: "qin_xa",         name: "Qin Xa (V - High Cmd)",            models: 1, bs: 4, t: 5, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "hibou_khan",     name: "Hibou Khan (V - Cmd)",              models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "stormseer",      name: "Stormseer (V - Cmd)",               models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "keshig_rider",   name: "Keshig Rider (V - Fast Attack)",    models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "kharash",        name: "Kharash Ebon Keshig (V - Elite)",   models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "kyzagan",        name: "Kyzagan Assault Speeder (V - Recon)", models: 1, bs: 4, t: 7, w: 4, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "VI: SPACE WOLVES", units: [
    { id: "hvarl",          name: "Hvarl Red-Blade (VI - High Cmd)",   models: 1, bs: 5, t: 5, w: 5, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "geigor",         name: "Geigor Fell-Hand (VI - Cmd)",       models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "caster_of_runes",name: "Caster of Runes (VI - Cmd)",        models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "varagyr",        name: "Varagyr Wolf Guard (VI - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "deathsworn",     name: "Deathsworn (VI - Elite)",           models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "grey_slayer",    name: "Grey Slayer Pack (VI - Troops)",     models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 7 },
  ]},
  { category: "VII: IMPERIAL FISTS", units: [
    { id: "sigismund",      name: "Sigismund (VII - High Cmd)",        models: 1, bs: 4, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "fafnir_rann",    name: "Fafnir Rann (VII - High Cmd)",      models: 1, bs: 4, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "evander_garrius",name: "Evander Garrius (VII - High Cmd)",  models: 1, bs: 5, t: 5, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "camba_diaz",     name: "Camba Diaz (VII - Cmd)",            models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "alexis_polux",   name: "Alexis Polux (VII - Cmd)",          models: 1, bs: 4, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "templar_brethren", name: "Templar Brethren (VII - Elite)",  models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "phalanx_warder", name: "Phalanx Warder (VII - Troops)",     models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "5", fnp: "-", ld: 7 },
  ]},
  { category: "VIII: NIGHT LORDS", units: [
    { id: "sevatar",        name: "Sevatar (VIII - High Cmd)",         models: 1, bs: 5, t: 4, w: 5, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "contekar",       name: "Contekar Terminator (VIII - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "executioner_nl", name: "Night Lords Executioner (VIII - Troops)", models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "night_raptor",   name: "Night Raptor (VIII - Fast Attack)", models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "IX: BLOOD ANGELS", units: [
    { id: "raldoron",       name: "Raldoron (IX - High Cmd)",          models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "dom_zephon",     name: "Dominion Zephon (IX - High Cmd)",   models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "aster_crohne",   name: "Aster Crohne (IX - Cmd)",           models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "crimson_paladin",name: "Crimson Paladin (IX - Elite)",       models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
    { id: "dawnbreaker",    name: "Dawnbreaker Guard (IX - Fast Attack)", models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 8 },
    { id: "erelim",         name: "Erelim Assault (IX - Troops)",      models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 7 },
    { id: "contemp_incaendius", name: "Contemptor-Incaendius (IX - War Engine)", models: 1, bs: 4, t: 7, w: 7, sv: "2", inv: "5", fnp: "-", ld: 10 },
  ]},
  { category: "X: IRON HANDS", units: [
    { id: "shadrak_meduson",name: "Shadrak Meduson (X - High Cmd)",    models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "iron_father",    name: "Iron Father (X - High Cmd)",        models: 1, bs: 5, t: 5, w: 5, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "gorgon_term",    name: "Gorgon Terminator (X - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "immortal_ih",    name: "Immortal (X - Troops)",             models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "5", fnp: "-", ld: 8 },
  ]},
  { category: "XII: WORLD EATERS", units: [
    { id: "kharn",          name: "Khârn the Bloody (XII - High Cmd)", models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "lotara_sarrin",  name: "Lotara Sarrin (XII - Cmd)",         models: 1, bs: 3, t: 3, w: 2, sv: "6", inv: "5", fnp: "-", ld: 9 },
    { id: "red_butcher",    name: "Red Butcher (XII - H.Assault)",     models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "5", ld: 12 },
    { id: "rampager",       name: "Rampager (XII - Elite)",            models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "XIII: ULTRAMARINES", units: [
    { id: "remus_ventanus", name: "Remus Ventanus (XIII - High Cmd)",  models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "invictarus_suz", name: "Invictarus Suzerain (XIII - Elite)", models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "5", fnp: "-", ld: 9 },
    { id: "praetorian_um",  name: "Praetorian Guard (XIII - Troops)",  models: 10, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "5", fnp: "-", ld: 7 },
  ]},
  { category: "XIV: DEATH GUARD", units: [
    { id: "calas_typhon",   name: "Calas Typhon (XIV - High Cmd)",     models: 1, bs: 5, t: 5, w: 5, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "deathshroud",    name: "Deathshroud Terminator (XIV - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "grave_warden",   name: "Grave Warden Terminator (XIV - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
  ]},
  { category: "XV: THOUSAND SONS", units: [
    { id: "ahriman",        name: "Ahzek Ahriman (XV - High Cmd)",     models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "magistus_amon",  name: "Magistus Amon (XV - Cmd)",          models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "prosperine_sorc",name: "Prosperine Sorcerer (XV - Cmd)",    models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "sekhmet",        name: "Sekhmet Terminator (XV - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
    { id: "khenetai_blade", name: "Khenetai Blade Cult (XV - Elite)",  models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "castellax_achea",name: "Castellax-Achea Automata (XV - War Engine)", models: 1, bs: 3, t: 6, w: 3, sv: "3", inv: "5", fnp: "-", ld: 12 },
    { id: "contemp_osiron", name: "Contemptor-Osiron (XV - War Engine)", models: 1, bs: 4, t: 7, w: 6, sv: "2", inv: "5", fnp: "-", ld: 10 },
  ]},
  { category: "XVI: SONS OF HORUS", units: [
    { id: "ezekyle_abaddon",name: "Ezekyle Abaddon (XVI - High Cmd)",  models: 1, bs: 5, t: 5, w: 5, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "little_horus",   name: "'Little' Horus Aximand (XVI - High Cmd)", models: 1, bs: 5, t: 5, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "tybalt_marr",    name: "Tybalt Marr (XVI - Cmd)",           models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "vheren_ash",     name: "Vheren Ashurhaddon (XVI - Cmd)",    models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "garviel_loken",  name: "Garviel Loken (XVI - Cmd)",         models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "maloghurst",     name: "Maloghurst the Twisted (XVI - Cmd)", models: 1, bs: 5, t: 4, w: 5, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "dark_emissary",  name: "Dark Emissary (XVI - Cmd)",         models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "justaerin",      name: "Justaerin Terminator (XVI - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "reaver_soh",     name: "Reaver Attack Squad (XVI - Elite)", models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "XVII: WORD BEARERS", units: [
    { id: "kor_phaeron",    name: "Kor Phaeron (XVII - High Cmd)",     models: 1, bs: 4, t: 3, w: 3, sv: "2", inv: "5", fnp: "-", ld: 10 },
    { id: "erebus",         name: "Erebus (XVII - Cmd)",               models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "argel_tal",      name: "Argel Tal (XVII - Cmd)",            models: 1, bs: 5, t: 5, w: 6, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "zardu_layak",    name: "Zardu Layak (XVII - Cmd)",          models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 11 },
    { id: "dark_brethren",  name: "Dark Brethren Gal Vorbak (XVII - Elite)", models: 5, bs: 4, hasSgt: true, t: 5, w: 3, sv: "3", inv: "-", fnp: "-", ld: 9 },
    { id: "anakatis_kul",   name: "Anakatis Kul Blade-Slaves (XVII - Elite)", models: 5, bs: 4, hasSgt: true, t: 5, w: 3, sv: "3", inv: "-", fnp: "-", ld: 10 },
    { id: "mhara_gal",      name: "Mhara Gal Dreadnought (XVII - War Engine)", models: 1, bs: 4, t: 7, w: 7, sv: "2", inv: "5", fnp: "-", ld: 12 },
    { id: "incendiary_wb",  name: "Incendiary (XVII - Troops)",        models: 10, bs: 4, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "XVIII: SALAMANDERS", units: [
    { id: "firedrake",      name: "Firedrake Terminator (XVIII - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 9 },
    { id: "pyroclast",      name: "Pyroclast (XVIII - Support)",       models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "2", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "XIX: RAVEN GUARD", units: [
    { id: "kaedes_nex",     name: "Kaedes Nex (XIX - Cmd)",            models: 1, bs: 6, t: 4, w: 3, sv: "3", inv: "5", fnp: "-", ld: 9 },
    { id: "mor_deythan",    name: "Mor Deythan (XIX - Recon)",         models: 5, bs: 5, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "dark_fury_rg",   name: "Dark Fury Assault (XIX - Fast Attack)", models: 5, bs: 4, hasSgt: true, t: 4, w: 2, sv: "3", inv: "-", fnp: "-", ld: 8 },
  ]},
  { category: "XX: ALPHA LEGION", units: [
    { id: "armillus_dynat", name: "Armillus Dynat (XX - High Cmd)",    models: 1, bs: 5, t: 4, w: 4, sv: "2", inv: "4", fnp: "-", ld: 10 },
    { id: "saboteur",       name: "Saboteur (XX - Cmd)",               models: 1, bs: 5, t: 4, w: 3, sv: "2", inv: "5", fnp: "-", ld: 8 },
    { id: "exodus_al",      name: "Exodus (XX - Cmd)",                 models: 1, bs: 8, t: 4, w: 3, sv: "3", inv: "5", fnp: "-", ld: 9 },
    { id: "headhunter",     name: "Headhunter (XX - Recon)",           models: 5, bs: 5, hasSgt: true, t: 4, w: 1, sv: "3", inv: "-", fnp: "-", ld: 8 },
    { id: "lernaean",       name: "Lernaean Terminator (XX - H.Assault)", models: 5, bs: 4, hasSgt: true, t: 5, w: 2, sv: "2", inv: "4", fnp: "-", ld: 8 },
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
  praetorian_cmd_jp: "elites", praetorian_cmd: "elites",
  tartaros_cmd: "elites", centurion_cmd: "elites", cataphractii_cmd: "elites",
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
  centurion: "hq", centurion_ta: "hq", champion: "hq", master_signals: "hq",
  vigilator: "hq", forge_lord: "hq", chaplain: "hq",
  librarian: "hq", herald: "hq", moritat: "hq", siege_breaker: "hq",
  // ── I Dark Angels ──
  corswain: "hq", marduk_sedras: "hq",          // High Command → hq
  deathwing_comp: "elites", inner_circle_knight: "elites",  // Elite
  dreadwing_inter: "troops",                     // Troops
  // ── III Emperor's Children ──
  eidolon: "hq", lucius: "hq", saul_tarvitz: "hq",  // High Cmd / Command → hq
  phoenix_term: "heavy_assault",                 // Heavy Assault
  palatine_blade: "elites",                      // Elite
  kakophoni: "support",                          // Support
  // ── IV Iron Warriors ──
  warsmith: "hq",                                // High Command → hq
  tyrant_siege_term: "heavy_assault",            // Heavy Assault
  domitar_ferrum: "war_engine",                  // War Engine
  // ── V White Scars ──
  qin_xa: "hq", hibou_khan: "hq", stormseer: "hq",  // High Cmd / Command → hq
  keshig_rider: "fast",                          // Fast Attack
  kharash: "elites",                             // Elite
  kyzagan: "recon",                              // Recon
  // ── VI Space Wolves ──
  hvarl: "hq", geigor: "hq", caster_of_runes: "hq",  // High Cmd / Command → hq
  varagyr: "heavy_assault",                      // Heavy Assault
  deathsworn: "elites",                          // Elite
  grey_slayer: "troops",                         // Troops
  // ── VII Imperial Fists ──
  sigismund: "hq", fafnir_rann: "hq", evander_garrius: "hq",  // High Command → hq
  camba_diaz: "hq", alexis_polux: "hq",          // Command → hq
  templar_brethren: "elites",                    // Elite
  phalanx_warder: "troops",                      // Troops
  // ── VIII Night Lords ──
  sevatar: "hq",                                 // High Command → hq
  contekar: "heavy_assault",                     // Heavy Assault
  executioner_nl: "troops",                      // Troops
  night_raptor: "fast",                          // Fast Attack
  // ── IX Blood Angels ──
  raldoron: "hq", dom_zephon: "hq", aster_crohne: "hq",  // High Cmd / Command → hq
  crimson_paladin: "elites",                     // Elite
  dawnbreaker: "fast",                           // Fast Attack
  erelim: "troops",                              // Troops
  contemp_incaendius: "war_engine",              // War Engine
  // ── X Iron Hands ──
  shadrak_meduson: "hq", iron_father: "hq",      // High Command → hq
  gorgon_term: "heavy_assault",                  // Heavy Assault
  immortal_ih: "troops",                         // Troops
  // ── XII World Eaters ──
  kharn: "hq", lotara_sarrin: "hq",              // High Cmd / Command → hq
  red_butcher: "heavy_assault",                  // Heavy Assault
  rampager: "elites",                            // Elite
  // ── XIII Ultramarines ──
  remus_ventanus: "hq",                          // High Command → hq
  invictarus_suz: "elites",                      // Elite
  praetorian_um: "troops",                       // Troops
  // ── XIV Death Guard ──
  calas_typhon: "hq",                            // High Command → hq
  deathshroud: "heavy_assault", grave_warden: "heavy_assault",  // Heavy Assault
  // ── XV Thousand Sons ──
  ahriman: "hq", magistus_amon: "hq", prosperine_sorc: "hq",  // High Cmd / Command → hq
  sekhmet: "heavy_assault",                      // Heavy Assault
  khenetai_blade: "elites",                      // Elite
  castellax_achea: "war_engine", contemp_osiron: "war_engine",  // War Engine
  // ── XVI Sons of Horus ──
  ezekyle_abaddon: "hq", little_horus: "hq",     // High Command → hq
  tybalt_marr: "hq", vheren_ash: "hq", garviel_loken: "hq",   // Command → hq
  maloghurst: "hq", dark_emissary: "hq",         // Command → hq
  justaerin: "heavy_assault",                    // Heavy Assault
  reaver_soh: "elites",                          // Elite
  // ── XVII Word Bearers ──
  kor_phaeron: "hq",                             // High Command → hq
  erebus: "hq", argel_tal: "hq", zardu_layak: "hq",  // Command → hq
  dark_brethren: "elites", anakatis_kul: "elites",   // Elite
  mhara_gal: "war_engine",                       // War Engine
  incendiary_wb: "troops",                       // Troops
  // ── XVIII Salamanders ──
  firedrake: "heavy_assault",                    // Heavy Assault
  pyroclast: "support",                          // Support
  // ── XIX Raven Guard ──
  kaedes_nex: "hq",                              // Command → hq
  mor_deythan: "recon",                          // Recon
  dark_fury_rg: "fast",                          // Fast Attack
  // ── XX Alpha Legion ──
  armillus_dynat: "hq", saboteur: "hq", exodus_al: "hq",  // High Cmd / Command → hq
  headhunter: "recon",                           // Recon
  lernaean: "heavy_assault",                     // Heavy Assault
};

// Equipment available to Troops and Elites
// ── Legion-specific wargear options per faction ──


Object.assign(window.HH, { BS_TO_HIT, CRITICAL_HIT_THRESHOLD, getWoundRoll, rollD6, rollD6s, WEAPON_TYPES, SPECIAL_RULES, UNIT_PRESETS, UNIT_FOC_SLOT });
})();
