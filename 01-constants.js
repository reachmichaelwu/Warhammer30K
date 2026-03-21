// Core game constants, dice, wound tables, special rules
// Lines 3-65 from shooting-resolver165.jsx

// ━━━ GAME DATA & CONSTANTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 3rd Edition BS Table - BS6+ can score Critical Hits
var BS_TO_HIT = { 
  1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 
  6: 2, 7: 2, 8: 2, 9: 2, 10: 2 
};

// Critical Hit thresholds for BS6+ (auto-wounds, bypasses wound roll)
var CRITICAL_HIT_THRESHOLD = {
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
var WEAPON_TYPES = [
  "Rapid Fire", "Heavy", "Assault", "Pistol", "Salvo", "Ordnance", "Barrage"
];

var SPECIAL_RULES = [
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
  // ── Additional rules from rulebook ──
  { id: "aflame", label: "Aflame", desc: "Unsaved wounds force a Leadership check; target is 'Aflame' until End Phase, -X to Ld on that check" },
  { id: "criticalHit", label: "Critical Hit (6+)", desc: "To Hit roll of 6 = auto-wound (bypasses Wound roll) and inflicts +1 Damage" },
  { id: "heavy", label: "Heavy (X)", desc: "Weapon gains +1 to a Characteristic (or AP improves one step) if the unit was Stationary last turn" },
  { id: "melta", label: "Melta (X)", desc: "Within half range, Penetrating Hits have their Damage doubled" },
  { id: "ordnance", label: "Ordnance (X)", desc: "Doubles the value of a Characteristic when the unit was Stationary last turn" },
  { id: "shock", label: "Shock (X)", desc: "To Hit rolls of 5 or 6 apply a Status to Vehicle/Walker models in the target unit" },
  { id: "skyfire", label: "Skyfire", desc: "Ignores all penalties for targeting Flyer sub-type units; makes normal Hit Tests instead of Snap Shots" },
  { id: "template", label: "Template", desc: "Uses Flame Template — no To Hit roll; every model fully or partially under the template is hit automatically" },
  { id: "barrage", label: "Barrage (X)", desc: "Can fire without Line of Sight (Indirect Fire); uses Blast marker + Scatter dice. Roll 2D6 for scatter distance if no HIT result" },
  { id: "firingProtocols", label: "Firing Protocols (X)", desc: "Model may make attacks with X Ranged Weapons in one Shooting Attack (each weapon can only be used once)" },
  { id: "force", label: "Force", desc: "Make a Willpower check before attacking — success doubles the listed Characteristic; failure causes Perils of the Warp" },
];

